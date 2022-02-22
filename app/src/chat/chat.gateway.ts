import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import {Server, Socket} from "socket.io";
import {OnModuleInit, ParseIntPipe, UseFilters} from "@nestjs/common";
import {AuthService} from "../auth/auth.service";
import {User} from "../users/user.entity";
import {UsersServiceSupport} from "../users/users.service-support";
import {UserSocketServiceSupport} from "./user-socket.service-support";
import {SocketExceptionFilter} from "./socket.exception-filter";
import {UserSocket} from "./model/user-socket.entity";
import {UserChatLink} from "./model/user-chat-link.entity";
import {Chat, ChatType} from "./model/chat.entity";
import {ChatAction, ChatServiceSupport} from "./chat.service-support";
import {Message} from "./model/message.entity";
import {MessageServiceSupport} from "./message.service-support";
import {MessageOutDto} from "./dto/message-out.dto";
import {plainToClass} from "class-transformer";
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {SocketValidationPipe} from "./socket.validation-pipe";
import {PageDto} from "./dto/page.dto";
import {MessagePageOutDto} from "./dto/message-page-out.dto";
import {ChangeType, ChatChange} from "./model/chat-change.entity";
import {ActionType} from "./dto/chat-brief-out.dto";
import {log} from "util";

@UseFilters(new SocketExceptionFilter())
@WebSocketGateway({
  namespace: "/chat",
  cors: {
    origin: ["http://localhost:3000", "http://localhost:4200"],
  },
})
export class ChatGateway
  implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  lookUserIdsByChatId: Map<number, number[]> = new Map<number, number[]>();

  constructor(
    private readonly authService: AuthService,
    private readonly usersServiceSupport: UsersServiceSupport,
    private readonly userSocketServiceSupport: UserSocketServiceSupport,
    private readonly chatServiceSupport: ChatServiceSupport,
    private readonly messageServiceSupport: MessageServiceSupport,
    @InjectRepository(UserSocket) private readonly socketRepository: Repository<UserSocket>,
    @InjectRepository(UserChatLink) private readonly userChatLinkRepository: Repository<UserChatLink>
  ) {}

  async onModuleInit(): Promise<void> {
    await this.userSocketServiceSupport.removeAllSockets();
  }

  async handleConnection(client: Socket): Promise<void> {
    const userId: number = this.getCurrentUserId(client);
    const user: User = await this.usersServiceSupport.getCurrentUser(userId);
    await this.userSocketServiceSupport.addUserSocket(user, client.id);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    await this.userSocketServiceSupport.removeSocket(client.id);
  }

  @SubscribeMessage("/enter")
  async onEnterChat(
    @MessageBody(ParseIntPipe) chatId: number,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const userId: number = this.getCurrentUserId(client);
    const user: User = await this.usersServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    let userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat, false);

    if (userChatLink == null) {
      userChatLink = new UserChatLink();
      userChatLink.chat = chat;
    }

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.ENTER_CHAT);

    const socket: UserSocket = await this.userSocketServiceSupport.findSocket(client.id);
    socket.activeChat = chat;
    await this.socketRepository.save(socket);

    const messagePage: MessagePageOutDto = await this.getMessagePage(chat, user, 20, 0);
    client.emit("/message/page-receive", messagePage);
  }

  @SubscribeMessage("/message/send")
  async onSendMessage(
    @MessageBody() text: string,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const userId: number = this.getCurrentUserId(client);
    const user: User = await this.usersServiceSupport.getCurrentUser(userId);
    const socket: UserSocket = await this.userSocketServiceSupport.findSocket(client.id);
    const activeChat: Chat = socket.activeChat;

    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, activeChat);
    ChatServiceSupport.verifyAction(userChatLink, ChatAction.SEND_MESSAGE);

    this.saveAndSendMessage(activeChat, user, text, null);
  }

  @SubscribeMessage("/message/page")
  async onReceiveMessages(
    @MessageBody(new SocketValidationPipe()) page: PageDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const userId: number = this.getCurrentUserId(client);
    const user: User = await this.usersServiceSupport.getCurrentUser(userId);
    const socket: UserSocket = await this.userSocketServiceSupport.findSocket(client.id);
    const activeChat: Chat = socket.activeChat;

    if (activeChat == null) {
      throw new WsException("Необходимо присоединиться к чату");
    }

    let userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, activeChat, false);
    if (userChatLink == null) {
      userChatLink = new UserChatLink();
      userChatLink.chat = activeChat;
    }

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.RECEIVE_MESSAGE);

    const messagePage: MessagePageOutDto = await this.getMessagePage(activeChat, user, page.take, page.skip);
    client.emit("/message/page-receive", messagePage);
  }

  sendSpecificMessages(chatChanges: ChatChange[], chat: Chat, createdLinks: UserChatLink[] = []) {
    chatChanges.forEach(chatChange => this.saveAndSendMessage(chat, null, null, chatChange, createdLinks));
  }

  async refreshChat(chat: Chat, change: ChatChange, targetUserLink: UserChatLink = null) {
    const linkByUserId: Map<number, UserChatLink> = new Map<number, UserChatLink>();
    const userIds: number[] = [];

    if (change.targetUser == null) {
      (await this.chatServiceSupport.filterUserChatLinks(null, chat, null, null, null, null, null)).forEach(link => {
        linkByUserId.set(link.user.id, link);
        userIds.push(link.user.id);
      });
    } else if (targetUserLink != null) {
      const targetUser = change.targetUser;
      userIds.push(targetUser.id);
      linkByUserId.set(targetUser.id, targetUserLink);
    }

    const sockets: UserSocket[] = await this.userSocketServiceSupport.findSockets(userIds);
    sockets.forEach((socket) => {
      let link = linkByUserId.get(socket.user.id);
      this.server.to(socket.id).emit("/chat/receive", this.chatServiceSupport.mapToChatBriefDto(link, change));
    });
  }

  private getCurrentUserId(client: Socket): number {
    const user: User = this.authService.decodeJwtToken(client.handshake.auth.token);
    if (!user) {
      this.disconnect(client);
    }
    return user.id;
  }

  private disconnect(client: Socket): void {
    throw new WsException("Connection was broken");
  }

  private async getMessagePage(chat: Chat, user: User, take: number, skip: number): Promise<MessagePageOutDto> {
    const blockedUsers: User[] = await this.getBlokedUsers(user);
    const messages: Message[] = await this.messageServiceSupport.findMessages(chat, blockedUsers, take, skip);

    const messageDtos: MessageOutDto[] = messages.map((message) => {
      const dto: MessageOutDto = plainToClass(MessageOutDto, message, {excludeExtraneousValues: true});
      if (message.chatChange != null) {
        dto.text = this.getChatchangeMessage(message.chatChange);
      }
      if (message.authorUser != null) {
        dto.authorUser.avatar = UsersServiceSupport.getUserAvatarPath(message.authorUser);
      }
      return dto;
    });
    return new MessagePageOutDto(messageDtos, take, skip);
  }

  private async saveAndSendMessage(
    targetChat: Chat,
    authorUser: User | null,
    text: string | null,
    chatChange: ChatChange | null,
    additionalTargetLinks: UserChatLink[] = [])
  {
    const message: Message = await this.messageServiceSupport.addMessage(authorUser, targetChat, text, chatChange);

    const messageDto: MessageOutDto = plainToClass(MessageOutDto, message, { excludeExtraneousValues: true });
    if (message.chatChange != null) {
      messageDto.text = this.getChatchangeMessage(message.chatChange);
    }
    if (message.authorUser != null) {
      messageDto.authorUser.avatar = UsersServiceSupport.getUserAvatarPath(message.authorUser);
    }

    const linkByUserId: Map<number, UserChatLink> = new Map<number, UserChatLink>();
    const userIds: number[] = [];
    const blockMeUserIds: number[] = authorUser != null ? (await this.getBlockMeUsers(authorUser)).map(u => u.id) : [];
    const targetLinks: UserChatLink[] = await this.chatServiceSupport
      .filterUserChatLinks(null, targetChat, null, null, true, null, null, false, blockMeUserIds);

    additionalTargetLinks.forEach(link => {
      if (targetLinks.findIndex(l => l.id == link.id) < 0) {
        targetLinks.push(link);
      }
    });

    targetLinks.forEach(link => {
      linkByUserId.set(link.user.id, link);
      userIds.push(link.user.id);
      link.dateTimeLastVisibleMessage = new Date();
      this.userChatLinkRepository.save(link);
    });

    if (chatChange != null) {
      if (!userIds.includes(chatChange.changerUser.id)) {
        userIds.push(chatChange.changerUser.id);
      }
      if (chatChange.targetUser != null && !userIds.includes(chatChange.targetUser.id)) {
        userIds.push(chatChange.targetUser.id);
      }
    }

    const sockets: UserSocket[] = await this.userSocketServiceSupport.findSockets(userIds, blockMeUserIds, targetChat);
    const defaultLink: UserChatLink = new UserChatLink();
    defaultLink.chat = targetChat;
    defaultLink.verified = false;
    sockets.forEach((socket) => {
      let link = linkByUserId.get(socket.user.id);
      if (link == null || !link.verified) {
        link = defaultLink;
      }

      messageDto.targetChat = this.chatServiceSupport.mapToChatBriefDto(link, chatChange);
      if (socket.activeChat != null && socket.activeChat.id == targetChat.id) {
        this.server.to(socket.id).emit("/message/receive", messageDto);
      } else {
        this.server.to(socket.id).emit("/chat/receive", messageDto.targetChat);
      }
    });
  }

  private getChatchangeMessage(chatChange: ChatChange): string {
    switch (chatChange.type) {
      case ChangeType.CREATION:
        return `${chatChange.changerUser.username} created chat`;
      case ChangeType.UPDATE_NAME:
        return `${chatChange.changerUser.username} update name`;
      case ChangeType.UPDATE_DESCRIPTION:
        return `${chatChange.changerUser.username} update description`;
      case ChangeType.UPDATE_AVATAR:
        return `${chatChange.changerUser.username} update avatar`;
      case ChangeType.ADD_PARTICIPANT:
        return `${chatChange.changerUser.username} added ${chatChange.targetUser.username}`;
      case ChangeType.REMOVE_PARTICIPANT:
        return `${chatChange.changerUser.username} removed ${chatChange.targetUser.username}`;
      case ChangeType.JOIN_CHAT:
        return `${chatChange.changerUser.username} joined chat`;
      case ChangeType.LEAVE_PRIVATE_CHAT:
      case ChangeType.LEAVE_CHAT:
        return `${chatChange.changerUser.username} leaved chat`;
    }
  }

  private async getBlokedUsers(user: User) {
    return (await this.chatServiceSupport.getBlockedUserDirectChatLinks(user))
      .map(link => link.user);
  }

  private async getBlockMeUsers(user: User) {
    return (await this.chatServiceSupport.getBlockMeDirectChatLinks(user))
      .map(link => link.secondUser);
  }
}

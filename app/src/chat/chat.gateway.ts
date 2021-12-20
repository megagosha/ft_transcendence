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
import {UserChatLink, UserChatStatus} from "./model/user-chat-link.entity";
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

  constructor(
    private readonly authService: AuthService,
    private readonly usersServiceSupport: UsersServiceSupport,
    private readonly userSocketServiceSupport: UserSocketServiceSupport,
    private readonly chatServiceSupport: ChatServiceSupport,
    private readonly messageServiceSupport: MessageServiceSupport,
    @InjectRepository(UserSocket) private readonly socketRepository: Repository<UserSocket>
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
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.ENTER_CHAT);

    const socket: UserSocket = await this.userSocketServiceSupport.findSocket(client.id);
    socket.activeChat = chat;
    await this.socketRepository.save(socket);
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

    if (activeChat == null) {
      throw new WsException("Необходимо присоединиться к чату");
    }

    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, activeChat);
    ChatServiceSupport.verifyAction(userChatLink, ChatAction.SEND_MESSAGE);

    let visible: boolean;
    if (activeChat.type == ChatType.PRIVATE) {
      const secondUserChatLink: UserChatLink = await this.chatServiceSupport.findSecondChatLink(user, activeChat);
      if (secondUserChatLink.userStatus == UserChatStatus.MUTED) {
        visible = false;
      }
    } else {
      visible = true;
    }

    const message: Message = await this.messageServiceSupport.addMessage(user, activeChat, text, visible);
    activeChat.dateTimeLastAction = new Date();
    await this.chatServiceSupport.updateChat(activeChat);

    const messageDto: MessageOutDto = plainToClass(MessageOutDto, message, { excludeExtraneousValues: true });
    const sockets: UserSocket[] = await this.userSocketServiceSupport.findSockets(activeChat);
    sockets.forEach((socket) => this.server.to(socket.id).emit("/message/receive", messageDto));
  }

  @SubscribeMessage("/message/page-receive")
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

    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, activeChat);
    ChatServiceSupport.verifyAction(userChatLink, ChatAction.RECEIVE_MESSAGE);

    const messages: Message[] = await this.messageServiceSupport.findMessages(activeChat, page.take, page.skip);
    const messageDtos: MessageOutDto[] = messages.map((message) => {
      return plainToClass(MessageOutDto, message, { excludeExtraneousValues: true });
    });

    client.emit("/message/page-receive", new MessagePageOutDto(messageDtos, page.take, page.skip));
  }

  private getCurrentUserId(client: Socket): number {
    const user: User = this.authService.decodeJwtToken(client.handshake.headers.authorization);
    if (!user) {
      this.disconnect(client);
    }
    return user.id;
  }

  private disconnect(client: Socket) {
    throw new WsException("Неавтиризованный пользователь");
  }
}
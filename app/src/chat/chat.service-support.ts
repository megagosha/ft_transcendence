import {BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserChatLink, UserChatRole, UserChatStatus} from "./model/user-chat-link.entity";
import {ILike, In, Not, Repository, SelectQueryBuilder} from "typeorm";
import {Chat, ChatType} from "./model/chat.entity";
import {User} from "../users/user.entity";
import {join} from "path";
import {chatAvatarsPath} from "../constants";

export enum ChatAction {
  CHAT_INFO,
  ADD_PARTICIPANT,
  UPDATE_CHAT_INFO,
  UPDATE_STATUS,
  UPDATE_ROLE,
  UPDATE_ACCESS,
  RECEIVE_MESSAGE,
  SEND_MESSAGE,
  ENTER_CHAT,
}

@Injectable()
export class ChatServiceSupport {
  private static readonly ROLES: Map<ChatAction, UserChatRole[]> = new Map<ChatAction, UserChatRole[]>();
  private static readonly STATUSES: Map<ChatAction, UserChatStatus[]> = new Map<ChatAction, UserChatStatus[]>();
  private static readonly TYPES: Map<ChatAction, ChatType[]> = new Map<ChatAction, ChatType[]>();
  private static readonly VERIFICATIONS: Map<ChatAction, boolean[]> = new Map<ChatAction, boolean[]>();

  static {
    ChatServiceSupport.ROLES.set(ChatAction.CHAT_INFO, [UserChatRole.OWNER, UserChatRole.ADMIN, UserChatRole.PARTICIPANT, null, undefined]);
    ChatServiceSupport.ROLES.set(ChatAction.ADD_PARTICIPANT, [UserChatRole.OWNER, UserChatRole.ADMIN]);
    ChatServiceSupport.ROLES.set(ChatAction.UPDATE_CHAT_INFO, [UserChatRole.OWNER, UserChatRole.ADMIN]);
    ChatServiceSupport.ROLES.set(ChatAction.UPDATE_STATUS, [UserChatRole.OWNER, UserChatRole.ADMIN]);
    ChatServiceSupport.ROLES.set(ChatAction.UPDATE_ROLE, [UserChatRole.OWNER]);
    ChatServiceSupport.ROLES.set(ChatAction.UPDATE_ACCESS, [UserChatRole.OWNER]);
    ChatServiceSupport.ROLES.set(ChatAction.RECEIVE_MESSAGE, [UserChatRole.OWNER, UserChatRole.ADMIN, UserChatRole.PARTICIPANT, null, undefined]);
    ChatServiceSupport.ROLES.set(ChatAction.SEND_MESSAGE, [UserChatRole.OWNER, UserChatRole.ADMIN, UserChatRole.PARTICIPANT]);
    ChatServiceSupport.ROLES.set(ChatAction.ENTER_CHAT, [UserChatRole.OWNER, UserChatRole.ADMIN, UserChatRole.PARTICIPANT, null, undefined]);

    ChatServiceSupport.STATUSES.set(ChatAction.CHAT_INFO, [UserChatStatus.ACTIVE, UserChatStatus.MUTED, null, undefined]);
    ChatServiceSupport.STATUSES.set(ChatAction.ADD_PARTICIPANT, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_CHAT_INFO, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_STATUS, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_ROLE, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_ACCESS, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.RECEIVE_MESSAGE, [UserChatStatus.ACTIVE, UserChatStatus.MUTED, null, undefined]);
    ChatServiceSupport.STATUSES.set(ChatAction.SEND_MESSAGE, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.ENTER_CHAT, [UserChatStatus.ACTIVE, UserChatStatus.MUTED, null, undefined]);

    ChatServiceSupport.TYPES.set(ChatAction.CHAT_INFO, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE]);
    ChatServiceSupport.TYPES.set(ChatAction.ADD_PARTICIPANT, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE]);
    ChatServiceSupport.TYPES.set(ChatAction.UPDATE_CHAT_INFO, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE]);
    ChatServiceSupport.TYPES.set(ChatAction.UPDATE_STATUS, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE, ChatType.DIRECT]);
    ChatServiceSupport.TYPES.set(ChatAction.UPDATE_ROLE, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE]);
    ChatServiceSupport.TYPES.set(ChatAction.UPDATE_ACCESS, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE]);
    ChatServiceSupport.TYPES.set(ChatAction.RECEIVE_MESSAGE, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE, ChatType.DIRECT]);
    ChatServiceSupport.TYPES.set(ChatAction.SEND_MESSAGE, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE, ChatType.DIRECT]);
    ChatServiceSupport.TYPES.set(ChatAction.ENTER_CHAT, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE, ChatType.DIRECT]);

    ChatServiceSupport.VERIFICATIONS.set(ChatAction.CHAT_INFO, [true, false, null, undefined]);
    ChatServiceSupport.VERIFICATIONS.set(ChatAction.ADD_PARTICIPANT, [true]);
    ChatServiceSupport.VERIFICATIONS.set(ChatAction.UPDATE_CHAT_INFO, [true]);
    ChatServiceSupport.VERIFICATIONS.set(ChatAction.UPDATE_STATUS, [true]);
    ChatServiceSupport.VERIFICATIONS.set(ChatAction.UPDATE_ROLE, [true]);
    ChatServiceSupport.VERIFICATIONS.set(ChatAction.UPDATE_ACCESS, [true]);
    ChatServiceSupport.VERIFICATIONS.set(ChatAction.RECEIVE_MESSAGE, [true, false, null, undefined]);
    ChatServiceSupport.VERIFICATIONS.set(ChatAction.SEND_MESSAGE, [true]);
    ChatServiceSupport.VERIFICATIONS.set(ChatAction.ENTER_CHAT, [true, false, null, undefined]);
  }

  constructor(
    @InjectRepository(UserChatLink)
    private readonly userChatLinkRepository: Repository<UserChatLink>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>
  ) {}

  async findChatById(id: number): Promise<Chat> {
    const chat: Chat = await this.chatRepository.findOne(id, {
      relations: ["ownerUser"],
    });
    if (!chat) {
      throw new NotFoundException("Чат не найден");
    }
    return chat;
  }

  async findUserChatLink(user: User, chat: Chat, throwExc: boolean = true): Promise<UserChatLink> {
    const userChatLink: UserChatLink =
      await this.userChatLinkRepository.findOne({
        where: {
          chat: chat,
          user: user,
        },
        relations: ["chat", "user"],
      });

    if (!userChatLink && throwExc) {
      throw new NotFoundException("Подписка на чат не найдена");
    }
    return userChatLink;
  }

  async filterUserChatLinks(
    user: User | null,
    chat: Chat | null,
    chatname: string | null,
    username: string | null,
    verified: boolean | null,
    take: number | null,
    skip: number | null
  ): Promise<UserChatLink[]> {
    const qb: SelectQueryBuilder<UserChatLink> = this.userChatLinkRepository
      .createQueryBuilder("link")
      .leftJoinAndSelect("link.user", "user")
      .leftJoinAndSelect("link.chat", "chat");

    if (chatname != null && chatname.length > 0) {
      qb.andWhere("chat.name ilike :name", { name: chatname + "%" });
    }
    if (username != null && username.length > 0) {
      qb.andWhere("user.username ilike :name", { name: username + "%" });
    }
    if (user != null) {
      qb.andWhere("link.user = :user", { user: user.id });
    }
    if (chat != null) {
      qb.andWhere("link.chat = :chat", { chat: chat.id });
    }
    if (verified != null) {
      qb.andWhere(`link.verified = ${verified}`);
    }
    if (take != null) {
      qb.take(take);
    }
    if (skip != null) {
      qb.skip(skip);
    }

    qb.orderBy("chat.dateTimeLastAction", "DESC");

    return qb.getMany();
  }

  async findSecondChatLink(user: User, chat: Chat): Promise<UserChatLink> {
    const userChatLinks: UserChatLink [] = await this.userChatLinkRepository.createQueryBuilder("link")
      .leftJoinAndSelect("link.user", "user")
      .leftJoinAndSelect("link.chat", "chat")
      .where("link.chat = :chat", { chat: chat.id })
      .andWhere("link.user != :user", { user: user.id })
      .getMany();

    if (userChatLinks.length != 2) {
      throw new InternalServerErrorException("userChatLinks.length not 2");
    }

    return userChatLinks[0];
  }

  async updateChat(chat: Chat): Promise<void> {
    await this.chatRepository.save(chat);
    Logger.log(`Chat[id=${chat.id}] was updated`);
  }

  async existsChatName(chatName: string, chat: Chat | null): Promise<boolean> {
    let found: Chat = await this.chatRepository.findOne({
      where: {
        name: ILike(chatName),
      },
    });

    if (chat != null && found != null && found.id == chat.id) {
      found = null;
    }

    return found != null;
  }

  async findChats(name: string, take: number, skip: number): Promise<Chat[]> {
    return await this.chatRepository.find({
      where: {
        name: ILike(name + "%"),
        type: Not(ChatType.PRIVATE),
      },
      take: take,
      skip: skip,
    });
  }

  async unblockUserChatLinks(dateExpire: Date) {
    await this.userChatLinkRepository.createQueryBuilder()
      .update()
      .set({ userStatus: UserChatStatus.ACTIVE, dateTimeBlockExpire: null })
      .andWhere("userStatus IN (:...statuses)", {statuses: [UserChatStatus.MUTED, UserChatStatus.BANNED]})
      .andWhere("dateTimeBlockExpire IS NOT null")
      .andWhere("dateTimeBlockExpire < :date", {date: dateExpire})
      .execute();
  }

  public static verifyAction(userChatLink: UserChatLink, action: ChatAction): void {
    const roles: UserChatRole[] = ChatServiceSupport.ROLES.get(action);
    const statuses: UserChatStatus[] = ChatServiceSupport.STATUSES.get(action);
    const types: ChatType[] = ChatServiceSupport.TYPES.get(action);
    const verifications: boolean[] = ChatServiceSupport.VERIFICATIONS.get(action);

    const chat: Chat = userChatLink.chat;

    if (!verifications.includes(userChatLink.verified)) {
      throw new BadRequestException("Подписка на чат неактивна");
    }

    if (!roles.includes(userChatLink.userRole) || !statuses.includes(userChatLink.userStatus)) {
      throw new BadRequestException("Недостаточно прав");
    }

    if (!types.includes(chat.type)) {
      throw new BadRequestException("Невозможное действие для чата");
    }
  }

  async findUserChatLinksByChats(user: User, chats: Chat[]): Promise<UserChatLink[]> {
    return await this.userChatLinkRepository.find({
      where: {
        user: user,
        chat: In(chats.map(chat => chat.id)),
      },
      relations: ["chat"],
    });
  }

  getChatAvatarPath(chat: Chat) {
    if (chat.avatar != null) {
      return `http://localhost:3000/files/chat/${chat.avatar}`;
    }
    return `http://localhost:3000/files/chat/default.png`;
  }
}

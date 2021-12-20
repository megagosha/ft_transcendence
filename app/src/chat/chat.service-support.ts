import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException, Logger,
  NotFoundException
} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserChatLink, UserChatRole, UserChatStatus} from "./model/user-chat-link.entity";
import {Repository, SelectQueryBuilder} from "typeorm";
import {Chat, ChatType} from "./model/chat.entity";
import {User} from "../users/user.entity";
import {use} from "passport";

export enum ChatAction {
  CHAT_INFO,
  ADD_PARTICIPANT,
  UPDATE_CHAT_INFO,
  UPDATE_STATUS,
  UPDATE_ROLE,
  UPDATE_PASS,
  RECEIVE_MESSAGE,
  SEND_MESSAGE,
  ENTER_CHAT,
}

@Injectable()
export class ChatServiceSupport {
  private static readonly ROLES: Map<ChatAction, UserChatRole[]> = new Map<ChatAction, UserChatRole[]>();
  private static readonly STATUSES: Map<ChatAction, UserChatStatus[]> = new Map<ChatAction, UserChatStatus[]>();
  private static readonly TYPES: Map<ChatAction, ChatType[]> = new Map<ChatAction, ChatType[]>();

  static {
    ChatServiceSupport.ROLES.set(ChatAction.CHAT_INFO, [UserChatRole.OWNER, UserChatRole.ADMIN, UserChatRole.PARTICIPANT]);
    ChatServiceSupport.ROLES.set(ChatAction.ADD_PARTICIPANT, [UserChatRole.OWNER, UserChatRole.ADMIN]);
    ChatServiceSupport.ROLES.set(ChatAction.UPDATE_CHAT_INFO, [UserChatRole.OWNER, UserChatRole.ADMIN]);
    ChatServiceSupport.ROLES.set(ChatAction.UPDATE_STATUS, [UserChatRole.OWNER, UserChatRole.ADMIN]);
    ChatServiceSupport.ROLES.set(ChatAction.UPDATE_ROLE, [UserChatRole.OWNER]);
    ChatServiceSupport.ROLES.set(ChatAction.UPDATE_PASS, [UserChatRole.OWNER]);
    ChatServiceSupport.ROLES.set(ChatAction.RECEIVE_MESSAGE, [UserChatRole.OWNER, UserChatRole.ADMIN, UserChatRole.PARTICIPANT]);
    ChatServiceSupport.ROLES.set(ChatAction.SEND_MESSAGE, [UserChatRole.OWNER, UserChatRole.ADMIN, UserChatRole.PARTICIPANT]);
    ChatServiceSupport.ROLES.set(ChatAction.ENTER_CHAT, [UserChatRole.OWNER, UserChatRole.ADMIN, UserChatRole.PARTICIPANT]);

    ChatServiceSupport.STATUSES.set(ChatAction.CHAT_INFO, [UserChatStatus.ACTIVE, UserChatStatus.MUTED]);
    ChatServiceSupport.STATUSES.set(ChatAction.ADD_PARTICIPANT, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_CHAT_INFO, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_STATUS, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_ROLE, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_PASS, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.RECEIVE_MESSAGE, [UserChatStatus.ACTIVE, UserChatStatus.MUTED]);
    ChatServiceSupport.STATUSES.set(ChatAction.SEND_MESSAGE, [UserChatStatus.ACTIVE]);
    ChatServiceSupport.STATUSES.set(ChatAction.ENTER_CHAT, [UserChatStatus.ACTIVE, UserChatStatus.MUTED]);

    ChatServiceSupport.TYPES.set(ChatAction.CHAT_INFO, [ChatType.PUBLIC, ChatType.PROTECTED]);
    ChatServiceSupport.TYPES.set(ChatAction.ADD_PARTICIPANT, [ChatType.PUBLIC, ChatType.PROTECTED]);
    ChatServiceSupport.TYPES.set(ChatAction.UPDATE_CHAT_INFO, [ChatType.PUBLIC, ChatType.PROTECTED]);
    ChatServiceSupport.TYPES.set(ChatAction.UPDATE_STATUS, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE]);
    ChatServiceSupport.TYPES.set(ChatAction.UPDATE_ROLE, [ChatType.PUBLIC, ChatType.PROTECTED]);
    ChatServiceSupport.TYPES.set(ChatAction.UPDATE_PASS, [ChatType.PUBLIC, ChatType.PROTECTED]);
    ChatServiceSupport.TYPES.set(ChatAction.RECEIVE_MESSAGE, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE]);
    ChatServiceSupport.TYPES.set(ChatAction.SEND_MESSAGE, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE]);
    ChatServiceSupport.TYPES.set(ChatAction.ENTER_CHAT, [ChatType.PUBLIC, ChatType.PROTECTED, ChatType.PRIVATE]);
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

  async findUserChatLink(user: User, chat: Chat): Promise<UserChatLink> {
    const userChatLink: UserChatLink =
      await this.userChatLinkRepository.findOne({
        where: {
          chat: chat,
          user: user,
        },
        relations: ["chat", "user"],
      });

    if (!userChatLink) {
      throw new NotFoundException("Подписка на чат не найдена");
    }
    return userChatLink;
  }

  async filterUserChatLinks(user: User, chat: Chat, take: number, skip: number): Promise<UserChatLink[]> {
    const qb: SelectQueryBuilder<UserChatLink> = this.userChatLinkRepository
      .createQueryBuilder("link")
      .leftJoinAndSelect("link.user", "user")
      .leftJoinAndSelect("link.chat", "chat");

    if (user != null) {
      qb.andWhere("link.user = :user", { user: user.id });
    }
    if (chat != null) {
      qb.andWhere("link.chat = :chat", { chat: chat.id });
    }
    if (take != null) {
      qb.take(take);
    }
    if (skip != null) {
      qb.skip(skip);
    }

    qb.orderBy("link.chat.dateTimeLastAction", "DESC");

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

  public static verifyAction(userChatLink: UserChatLink, action: ChatAction): void {
    const roles: UserChatRole[] = ChatServiceSupport.ROLES.get(action);
    const statuses: UserChatStatus[] = ChatServiceSupport.STATUSES.get(action);
    const types: ChatType[] = ChatServiceSupport.TYPES.get(action);
    const chat: Chat = userChatLink.chat;

    if (!roles.includes(userChatLink.userRole) || !statuses.includes(userChatLink.userStatus)) {
      throw new ForbiddenException("Недостаточно прав");
    }

    if (!types.includes(chat.type)) {
      throw new BadRequestException("Невозможное действие для чата");
    }

    if (chat.type == ChatType.PROTECTED && !userChatLink.verified) {
      throw new ForbiddenException("Пароль от чата устарел");
    }
  }
}

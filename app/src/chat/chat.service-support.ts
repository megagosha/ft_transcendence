import {BadRequestException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {UserChatLink, UserChatRole, UserChatStatus} from "./model/user-chat-link.entity";
import {ILike, In, Not, Repository, SelectQueryBuilder} from "typeorm";
import {Chat, ChatType} from "./model/chat.entity";
import {User} from "../users/user.entity";
import {ChatBriefOutDto} from "./dto/chat-brief-out.dto";
import {UsersServiceSupport} from "../users/users.service-support";
import {plainToClass} from "class-transformer";
import {ChatChange} from "./model/chat-change.entity";
import {ChatChangeDto} from "./dto/chat-change.dto";

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
    ChatServiceSupport.STATUSES.set(ChatAction.ADD_PARTICIPANT, [UserChatStatus.ACTIVE, UserChatStatus.MUTED]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_CHAT_INFO, [UserChatStatus.ACTIVE, UserChatStatus.MUTED]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_STATUS, [UserChatStatus.ACTIVE, UserChatStatus.MUTED]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_ROLE, [UserChatStatus.ACTIVE, UserChatStatus.MUTED]);
    ChatServiceSupport.STATUSES.set(ChatAction.UPDATE_ACCESS, [UserChatStatus.ACTIVE, UserChatStatus.MUTED]);
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
    @InjectRepository(UserChatLink) private readonly userChatLinkRepository: Repository<UserChatLink>,
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
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
        relations: ["chat", "user", "secondUser"],
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
    skip: number | null,
    includeBanned: boolean = null,
    excludeUserIds : number[] = []
  ): Promise<UserChatLink[]> {
    const qb: SelectQueryBuilder<UserChatLink> = this.userChatLinkRepository
      .createQueryBuilder("link")
      .leftJoinAndSelect("link.user", "user")
      .leftJoinAndSelect("link.secondUser", "seconduser")
      .leftJoinAndSelect("link.chat", "chat")
      .where("link.dateTimeLastVisibleMessage IS NOT NULL");

    if (chatname != null && chatname.length > 0) {
      qb.andWhere(
        "((chat.type != :type AND chat.name ILIKE :name) " +
        "OR (chat.type = :type AND seconduser IS NOT NULL AND seconduser.username ILIKE :name))",
        {type:ChatType.DIRECT, name: chatname + "%"});
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
    if (includeBanned != null && !includeBanned) {
      qb.andWhere("link.userStatus != 'BANNED'");
    }
    if (excludeUserIds != null && excludeUserIds.length > 0) {
      qb.andWhere("link.user NOT IN (:...users)", { users: excludeUserIds });
    }
    if (take != null) {
      qb.take(take);
    }
    if (skip != null) {
      qb.skip(skip);
    }

    qb.orderBy("link.dateTimeLastVisibleMessage", "DESC", "NULLS LAST");

    return qb.getMany();
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
        type: Not(In([ChatType.PRIVATE, ChatType.DIRECT])),
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

  async findDirectChatLink(user: User, secondUser: User): Promise<UserChatLink> {
    return await this.userChatLinkRepository.findOne({
      where: {
        user: user,
        secondUser: secondUser
      },
      relations: ["chat", "user", "secondUser"]
    });
  }

  getChatAvatarPath(chat: Chat) {
    if (chat.avatar != null) {
      return `/files/chat/${chat.avatar}`;
    }
    return `/files/chat/default.png`;
  }

  async getBlockedUserDirectChatLinks(user: User) {
    return await this.userChatLinkRepository.find({
      where: {
        secondUser: user,
        userStatus: UserChatStatus.MUTED,
      },
      relations: ["user", "secondUser"]
    });
  }

  async getBlockMeDirectChatLinks(user: User) {
    return this.userChatLinkRepository.createQueryBuilder("link")
      .leftJoinAndSelect("link.user", "first")
      .leftJoinAndSelect("link.secondUser", "second")
      .leftJoinAndSelect("link.chat", "chat")
      .where("link.user = :user", {user: user.id})
      .andWhere("link.secondUser IS NOT NULL")
      .andWhere("link.userStatus = :status", {status: UserChatStatus.MUTED})
      .getMany();
  }

  mapToChatBriefDto(link: UserChatLink, change: ChatChange = null): ChatBriefOutDto {
    const dto = plainToClass(ChatBriefOutDto, link.chat, { excludeExtraneousValues: true });
    if (dto.type != ChatType.DIRECT) {
      dto.dateTimeBlockExpire = link.dateTimeBlockExpire;
      dto.verified = link.verified;
      dto.userChatRole = link.userRole;
      dto.userChatStatus = link.userStatus;
      dto.avatar = this.getChatAvatarPath(link.chat);
    } else {
      dto.verified = true;
      dto.name = link.secondUser.username;
      dto.userChatStatus = link.userStatus;
      dto.secondUserId = link.secondUser.id;
      dto.avatar = UsersServiceSupport.getUserAvatarPath(link.secondUser);
    }

    if (change != null) {
      const changeDto: ChatChangeDto = new ChatChangeDto();
      changeDto.changeType = change.type;
      changeDto.changerUserId = change.changerUser.id;
      changeDto.targetUserId = change.targetUser?.id;
      dto.change = changeDto;
    }

    return dto;
  }

  async isBlockedUser(user: User, targetUser: User) {
    return (await this.findDirectChatLink(targetUser, user)).userStatus == UserChatStatus.MUTED;
  }
}

import {BadRequestException, ForbiddenException, Injectable, Logger} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Chat, ChatType} from "./model/chat.entity";
import {ChatCreateInDto} from "./dto/chat-create-in.dto";
import {User} from "../users/user.entity";
import {Repository} from "typeorm";
import {UserChatLink, UserChatRole, UserChatStatus,} from "./model/user-chat-link.entity";
import {SecurityUtil} from "../util/security.util";
import {ChatCreateOutDto} from "./dto/chat-create-out.dto";
import {UsersServiceSupport} from "../users/users.service-support";
import {ChatAction, ChatServiceSupport} from "./chat.service-support";
import {ChatPassUpdateInDto} from "./dto/chat-pass-update-in.dto";
import {ChatUserStatusUpdateInDto} from "./dto/chat-user-status-update-in.dto";
import {ChatUserRoleUpdateInDto} from "./dto/chat-user-role-update-in.dto";
import {plainToClass} from "class-transformer";
import {ChatBriefOutDto} from "./dto/chat-brief-out.dto";
import {ChatPageOutDto} from "./dto/chat-page-out.dto";
import {ChatOutDto} from "./dto/chat-out.dto";
import {ChatUpdateInDto} from "./dto/chat-update-in.dto";
import {ChatUserOutDto} from "./dto/chat-user-out.dto";


@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(UserChatLink) private readonly userChatLinkRepository: Repository<UserChatLink>,
    private readonly userServiceSupport: UsersServiceSupport,
    private readonly chatServiceSupport: ChatServiceSupport
  ) {}

  async createChat(dto: ChatCreateInDto, userId: number) : Promise<ChatCreateOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);

    const chat: Chat = new Chat();
    chat.ownerUser = user;
    chat.password = dto.type === ChatType.PROTECTED ? SecurityUtil.hashPassword(dto.password) : null;
    chat.name = dto.name;
    chat.description = dto.description;
    chat.type = dto.type;
    chat.dateTimeLastAction = new Date();
    await this.chatRepository.save(chat);
    Logger.log(`Chat [id=${chat.id}] was created`);

    const userChatLink = this.createUserChatLink(chat, user, UserChatRole.OWNER);
    await this.userChatLinkRepository.save(userChatLink);
    Logger.log(`Link for user[id=${userId}] and chat[id=${chat.id}] was created`);

    return new ChatCreateOutDto(chat.id);
  }

  async createPrivateChat(userId: number, targetUserId: number): Promise<ChatCreateOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const targetUser: User = await this.userServiceSupport.findById(targetUserId);

    const chat: Chat = new Chat();
    chat.ownerUser = user;
    chat.name = "Личные сообщения";
    chat.type = ChatType.PRIVATE;
    chat.dateTimeLastAction = new Date();
    await this.chatRepository.save(chat);
    Logger.log(`Private chat [id=${chat.id}] was created`);

    const userChatLink = this.createUserChatLink(chat, user, UserChatRole.ADMIN);
    const targetUserChatLink = this.createUserChatLink(chat, targetUser, UserChatRole.ADMIN);
    await this.userChatLinkRepository.save([userChatLink, targetUserChatLink]);
    Logger.log(`Links for users [${userId}, ${targetUser.id}] and private chat[id=${chat.id}] was created`);

    return new ChatCreateOutDto(chat.id);
  }

  async addParticipants(userId: number, chatId: number, userIds: number[]): Promise<void> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.ADD_PARTICIPANT);

    // Вытащим id уже подписаных пользователей через их подписки на выбранный чат
    const existLinks: UserChatLink[] = await this.userChatLinkRepository
      .createQueryBuilder("link")
      .leftJoinAndSelect("link.user", "user")
      .leftJoinAndSelect("link.chat", "chat")
      .where("link.chat = :chat", { chat: chatId })
      .andWhere("link.user IN (:...users)", { users: userIds })
      .getMany();
    const linkedUserIds: number[] = existLinks.map((link) => link.user.id);

    // Получим неподписанных пользователей
    const notLinkedUserIds: number[] = userIds.filter((id) => !linkedUserIds.includes(id));
    const notLinkedUsers: User[] = await this.userServiceSupport.findByIds(notLinkedUserIds);

    // Создадим для каждого неподписанного пользователя подписку с ролью PARTICIPANT
    const userChatLinks: UserChatLink[] = notLinkedUsers.map((user) => {
      return this.createUserChatLink(chat, user, UserChatRole.PARTICIPANT);
    });
    await this.userChatLinkRepository.save(userChatLinks);

    chat.dateTimeLastAction = new Date();
    await this.chatServiceSupport.updateChat(chat);

    notLinkedUsers.forEach(user => Logger.log(`Participant [id=${user.id}] was added to chat[id=${chatId}]`));
  }

  async updatePassword(userId: number, chatId: number, dto: ChatPassUpdateInDto): Promise<void> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_PASS);

    if (SecurityUtil.checkPassword(dto.password, chat.password)) {
      return;
    }

    if (dto.password != null) {
      chat.password = SecurityUtil.hashPassword(dto.password);
      chat.type = ChatType.PROTECTED;
    } else {
      chat.password = null;
      chat.type = ChatType.PUBLIC;
    }
    await this.chatRepository.save(chat);

    const userChatLinks: UserChatLink[] = await this.userChatLinkRepository.find({ chat: chat });
    userChatLinks.forEach((link) => {
      link.verified = false;
      console.log(link.verified);
    });
    userChatLink.verified = true;
    await this.userChatLinkRepository.save(userChatLinks);

    Logger.log(`Password for chat[id=${chat.id}] was updated]`);
  }

  async updateChat(userId: number, chatId: number, dto: ChatUpdateInDto): Promise<void> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_CHAT_INFO);

    chat.name = dto.name;
    chat.description = dto.description;
    chat.avatarFileId = dto.avatarFileId;
    await this.chatRepository.save(chat);

    Logger.log(`Chat[id=${chat.id}] was updated]`);
  }

  async updateUserChatRole(
    userId: number,
    chatId: number,
    participantId: number,
    dto: ChatUserRoleUpdateInDto
  ): Promise<void> {
    if (userId == participantId) {
      throw new BadRequestException("Нельзя изменить роль самому себе");
    }

    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_ROLE);

    const participant: User = await this.userServiceSupport.findById(participantId, "Участник чата не найден");
    const participantChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(participant, chat);

    participantChatLink.userRole = dto.role;
    await this.userChatLinkRepository.save(participantChatLink);

    Logger.log(`Participant [id=${participantId}] became ${dto.role} in chat[id=${chat.id}]`);
  }

  async updateUserChatStatus(
    userId: number,
    chatId: number,
    participantId: number,
    dto: ChatUserStatusUpdateInDto
  ): Promise<void> {
    if (userId == participantId) {
      throw new BadRequestException("Нельзя изменить статус самому себе");
    }

    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_STATUS);

    const participant: User = await this.userServiceSupport.findById(participantId, "Участник чата не найден");
    const participantChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(participant, chat);

    if (chat.type == ChatType.PRIVATE) {
      userChatLink.userStatus = dto.status != UserChatStatus.ACTIVE ? UserChatStatus.MUTED : dto.status;
      await this.userChatLinkRepository.save(userChatLink);
      Logger.log(`User[id=${userId}] blocked user[id=${participantId}]`);
    } else {
      participantChatLink.userStatus = dto.status;
      participantChatLink.dateTimeBlockExpire = dto.status != UserChatStatus.ACTIVE ? dto.dateTimeBlockExpire : null;
      await this.userChatLinkRepository.save(participantChatLink);
      Logger.log(`Participant [id=${participantId}] was ${dto.status} in chat[id=${chat.id}]`);
    }
  }

  async joinChat(userId: number, chatId: number, password: string) {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);

    // Проверим возможность вступить в чат
    if (chat.type == ChatType.PRIVATE) {
      throw new ForbiddenException("Вступить в в приватный чат нельзя");
    }
    if (chat.type == ChatType.PROTECTED) {
      if (password == null) {
        throw new ForbiddenException("Необходимо ввести пароль");
      } else if (!SecurityUtil.checkPassword(password, chat.password)) {
        throw new ForbiddenException("Неверный пароль");
      }
    }

    let userChatLink: UserChatLink = await this.userChatLinkRepository.findOne({chat: chat, user: user});
    if (!userChatLink) {
      userChatLink = this.createUserChatLink(chat, user);
      chat.dateTimeLastAction = new Date();
      await this.chatServiceSupport.updateChat(chat);
    } else {
      userChatLink.verified = true;
    }

    await this.userChatLinkRepository.save(userChatLink);

    Logger.log(`User [id=${userId}] joined in chat[id=${chat.id}]`);
  }

  async leaveChat(userId: number, chatId: number) {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);

    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
    await this.userChatLinkRepository.delete(userChatLink);

    Logger.log(`User [id=${userId}] left chat[id=${chat.id}]`);
  }

  async getUserChats(userId: number, take: number, skip: number): Promise<ChatPageOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const userChatLinks: UserChatLink[] = await this.chatServiceSupport.filterUserChatLinks(user, null, take, skip);

    const chatDtos: ChatBriefOutDto[] = userChatLinks.map((link) => {
      const dto = plainToClass(ChatBriefOutDto, link.chat, { excludeExtraneousValues: true });
      dto.userChatRole = link.userRole;
      dto.userChatStatus = link.userStatus;
      return dto;
    });

    return new ChatPageOutDto(chatDtos, take, skip);
  }

  async getChat(userId: number, chatId: number): Promise<ChatOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.CHAT_INFO);

    const chatDto: ChatOutDto = plainToClass(ChatOutDto, chat, { excludeExtraneousValues: true });
    chatDto.userCount = await this.userChatLinkRepository.count({ chat: chat });
    return chatDto;
  }

  async getChatUsers(userId: number, chatId: number): Promise<ChatUserOutDto[]> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.CHAT_INFO);

    const userChatLinks: UserChatLink[] = await this.chatServiceSupport.filterUserChatLinks(null, chat, null, null);

    return userChatLinks.map((link) => {
      const userDto = plainToClass(ChatUserOutDto, link.user, { excludeExtraneousValues: true });
      userDto.userChatRole = link.userRole;
      userDto.userChatStatus = link.userStatus;
      return userDto;
    });
  }

  private createUserChatLink(
    chat: Chat,
    user: User,
    userRole: UserChatRole = UserChatRole.PARTICIPANT
  ): UserChatLink {
    const userChatLink = new UserChatLink();
    userChatLink.user = user;
    userChatLink.chat = chat;
    userChatLink.userRole = userRole;
    userChatLink.userStatus = UserChatStatus.ACTIVE;
    userChatLink.verified = true;
    return userChatLink;
  }
}

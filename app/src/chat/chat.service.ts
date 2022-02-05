import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnsupportedMediaTypeException
} from "@nestjs/common";
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
import {ChatAccessUpdateInDto} from "./dto/chat-access-update-in.dto";
import {ChatUserUpdateInDto} from "./dto/chat-user-update-in.dto";
import {ChatUserRoleUpdateInDto} from "./dto/chat-user-role-update-in.dto";
import {plainToClass} from "class-transformer";
import {ChatBriefOutDto} from "./dto/chat-brief-out.dto";
import {ChatPageOutDto} from "./dto/chat-page-out.dto";
import {ChatOutDto} from "./dto/chat-out.dto";
import {ChatUpdateInDto} from "./dto/chat-update-in.dto";
import {ChatUserOutDto} from "./dto/chat-user-out.dto";
import {UuidUtil} from "../util/uuid.util";
import {UserBriefOutDto} from "./dto/user-brief-out-dto";
import {UserBriefPageOutDto} from "./dto/user-brief-page-out-dto";
import {ChatUserPageOutDto} from "./dto/chat-user-page-out-dto";
import {File} from "../file/model/file.entity";
import {Uuid} from "node-ts-uuid";
import {FilesServiceSupport} from "../file/files.service-support";
import { v4 as uuidv4 } from 'uuid';
import {open, rm, writeFile} from "fs";
import {join} from "path";

@Injectable()
export class ChatService {

  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(UserChatLink) private readonly userChatLinkRepository: Repository<UserChatLink>,
    private readonly userServiceSupport: UsersServiceSupport,
    private readonly chatServiceSupport: ChatServiceSupport,
    private readonly fileServiceSupport: FilesServiceSupport,
  ) {}

  async createChat(dto: ChatCreateInDto, userId: number) : Promise<ChatCreateOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);

    if (await this.chatServiceSupport.existsChatName(dto.name, null)) {
      throw new BadRequestException("Чат с таким названием уже существует");
    }

    const chat: Chat = new Chat();
    chat.ownerUser = user;
    chat.name = dto.name;
    chat.description = dto.description;
    chat.dateTimeLastAction = new Date();
    this.setTypeAndPassword(chat, dto.password, dto.type);
    await this.chatRepository.save(chat);
    Logger.log(`Chat [id=${chat.id}] was created`);

    const userChatLink = this.createUserChatLink(chat, user, UserChatRole.OWNER);
    await this.userChatLinkRepository.save(userChatLink);
    Logger.log(`Link for user[id=${userId}] and chat[id=${chat.id}] was created`);

    return new ChatCreateOutDto(chat.id);
  }

  async createDirectChat(userId: number, targetUserId: number): Promise<ChatCreateOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const targetUser: User = await this.userServiceSupport.findById(targetUserId);

    const chat: Chat = new Chat();
    chat.ownerUser = user;
    chat.name = uuidv4();
    chat.type = ChatType.DIRECT;
    chat.dateTimeLastAction = new Date();
    await this.chatRepository.save(chat);
    Logger.log(`Direct chat [id=${chat.id}] was created`);

    const userChatLink = this.createUserChatLink(chat, user, UserChatRole.ADMIN);
    const targetUserChatLink = this.createUserChatLink(chat, targetUser, UserChatRole.ADMIN);
    await this.userChatLinkRepository.save([userChatLink, targetUserChatLink]);
    Logger.log(`Links for users [${userId}, ${targetUser.id}] and direct chat[id=${chat.id}] was created`);

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

    // Верифицируем уже существующие подписки
    existLinks.forEach((link) => link.verified = true);
    await this.userChatLinkRepository.save(existLinks);

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

  async deleteParticipant(userId: number, chatId: number, participantId: number): Promise<void> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.ADD_PARTICIPANT);

    const participant: User = await this.userServiceSupport.findById(participantId, "Участник не найден");
    const participantChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(participant, chat);
    participantChatLink.verified = false;
    await this.userChatLinkRepository.save(participantChatLink);

    Logger.log(`Participant [id=${participantId} was disabled in chat [id=${chatId}]]`);
  }

  async updateAccess(userId: number, chatId: number, dto: ChatAccessUpdateInDto): Promise<void> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_ACCESS);

    this.setTypeAndPassword(chat, dto.password, dto.type);
    await this.chatServiceSupport.updateChat(chat);

    if (dto.dropVerification) {
      const userChatLinks: UserChatLink[] = await this.userChatLinkRepository.find({ chat: chat, userRole: UserChatRole.PARTICIPANT });
      userChatLinks.forEach((link) => {
        link.verified = false;
      });
      await this.userChatLinkRepository.save(userChatLinks);
    }

    Logger.log(`Password for chat[id=${chat.id}] was updated]`);
  }

  async updateChat(userId: number, chatId: number, dto: ChatUpdateInDto): Promise<void> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_CHAT_INFO);

    if (await this.chatServiceSupport.existsChatName(dto.name, chat)) {
      throw new BadRequestException("Чат с таким названием уже существует");
    }

    chat.name = dto.name;
    chat.description = dto.description == null || dto.description.length == 0 ? null : dto.description;
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

  async updateUserChat(
    userId: number,
    chatId: number,
    participantId: number,
    dto: ChatUserUpdateInDto
  ): Promise<void> {
    let dateTimeBlockExpire: Date;

    if (dto.dateTimeBlockExpire != null) {
      dateTimeBlockExpire = new Date(dto.dateTimeBlockExpire);
      if (dateTimeBlockExpire < new Date()) {
        throw new BadRequestException("Дата окончания блокировки не должна быть позже текущей");
      }
    }

    if (userId == participantId) {
      throw new BadRequestException("Нельзя изменить статус самому себе");
    }

    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    const participant: User = await this.userServiceSupport.findById(participantId, "Участник чата не найден");
    const participantChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(participant, chat);

    if (participantChatLink.userRole != dto.role) {
      ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_ROLE);
    } else if (participantChatLink.userStatus != dto.status
        || participantChatLink.dateTimeBlockExpire != dto.dateTimeBlockExpire) {
      ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_STATUS);
    } else {
      return;
    }

    if (chat.type == ChatType.DIRECT) {
      userChatLink.userStatus = dto.status != UserChatStatus.ACTIVE ? UserChatStatus.MUTED : dto.status;
      await this.userChatLinkRepository.save(userChatLink);
      Logger.log(`User[id=${userId}] blocked user[id=${participantId}]`);
    } else {
      participantChatLink.userStatus = dto.status;
      participantChatLink.dateTimeBlockExpire = dateTimeBlockExpire;
      await this.userChatLinkRepository.save(participantChatLink);
      Logger.log(`Participant [id=${participantId}] was ${dto.status} in chat[id=${chat.id}]`);
    }
  }

  async joinChat(userId: number, chatId: number, password: string) {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);

    // Проверим возможность вступить в чат
    if (chat.type == ChatType.DIRECT) {
      throw new BadRequestException("Вступить в личный чат нельзя");
    }

    if (chat.type == ChatType.PROTECTED) {
      if (password == null) {
        throw new BadRequestException("Необходимо ввести пароль");
      } else if (!SecurityUtil.checkPassword(password, chat.password)) {
        throw new BadRequestException("Неверный пароль");
      }
    }

    let userChatLink: UserChatLink = await this.userChatLinkRepository.findOne({chat: chat, user: user});
    if (!userChatLink) {
      if (chat.type == ChatType.PRIVATE) {
        throw new BadRequestException("Вступить в приватный чат нельзя");
      }
      userChatLink = this.createUserChatLink(chat, user);
      chat.dateTimeLastAction = new Date();
      await this.chatServiceSupport.updateChat(chat);
    }
    userChatLink.verified = true;

    await this.userChatLinkRepository.save(userChatLink);

    Logger.log(`User [id=${userId}] joined in chat[id=${chat.id}]`);
  }

  async leaveChat(userId: number, chatId: number) {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);

    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
    userChatLink.verified = false;
    await this.userChatLinkRepository.save(userChatLink);

    Logger.log(`User [id=${userId}] left(disable self) chat[id=${chat.id}]`);
  }

  async getUserChats(userId: number, name: string, global: boolean, take: number, skip: number): Promise<ChatPageOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);

    let chatDtos: ChatBriefOutDto[];
    if (global) {
      const chats: Chat[] = await this.chatServiceSupport.findChats(name, take, skip);

      const linkByChatId: Map<number, UserChatLink> = new Map<number, UserChatLink>();
      (await this.chatServiceSupport.findUserChatLinksByChats(user, chats)).forEach((link) => {
        linkByChatId.set(link.chat.id, link);
      });

      chatDtos = chats.map((chat) => {
        const dto = plainToClass(ChatBriefOutDto, chat, { excludeExtraneousValues: true });
        const link = linkByChatId.get(chat.id);
        if (link != null) {
          dto.userChatRole = link.userRole;
          dto.userChatStatus = link.userStatus;
          dto.dateTimeBlockExpire = link.dateTimeBlockExpire;
          dto.verified = link.verified;
          dto.avatar = this.chatServiceSupport.getChatAvatarPath(chat);
        }
        return dto;
      });
    } else {
      const userChatLinks: UserChatLink[] = await this.chatServiceSupport.filterUserChatLinks(user, null, name, null, null, take, skip);
      chatDtos = userChatLinks.map((link) => {
        const dto = plainToClass(ChatBriefOutDto, link.chat, { excludeExtraneousValues: true });
        dto.userChatRole = link.userRole;
        dto.userChatStatus = link.userStatus;
        dto.dateTimeBlockExpire = link.dateTimeBlockExpire;
        dto.verified = link.verified;
        dto.avatar = this.chatServiceSupport.getChatAvatarPath(link.chat);
        return dto;
      });
    }
    return new ChatPageOutDto(chatDtos, take, skip);
  }

  async getChat(userId: number, chatId: number): Promise<ChatOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    let userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat, false);

    if (userChatLink == null) {
      userChatLink = new UserChatLink();
      userChatLink.chat = chat;
    }

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.CHAT_INFO);

    const chatDto: ChatOutDto = plainToClass(ChatOutDto, chat, { excludeExtraneousValues: true });
    chatDto.avatar = this.chatServiceSupport.getChatAvatarPath(chat);
    chatDto.userCount = await this.userChatLinkRepository.count({ chat: chat, verified: true });
    return chatDto;
  }

  async getChatUsers(
    userId: number,
    name: string,
    chatId: number,
    take: number,
    skip: number
  ): Promise<ChatUserPageOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.CHAT_INFO);

    const userChatLinks: UserChatLink[] = await this.chatServiceSupport.filterUserChatLinks(
        null,
        chat,
        null,
        name,
        true,
        take,
        skip
      );

    const users: ChatUserOutDto[] = userChatLinks.map((link) => {
      const userDto = plainToClass(ChatUserOutDto, link.user, { excludeExtraneousValues: true });
      userDto.userChatRole = link.userRole;
      userDto.userChatStatus = link.userStatus;
      userDto.dateTimeBlockExpire = link.dateTimeBlockExpire;
      userDto.verified = link.verified;
      return userDto;
    });

    return new ChatUserPageOutDto(users, take, skip);
  }

  async findNotParticipants(
    userId: number,
    chatId: number,
    name: string,
    take: number,
    skip: number
  ): Promise<UserBriefPageOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.ADD_PARTICIPANT);

    const existLinks: UserChatLink[] = await this.userChatLinkRepository
      .createQueryBuilder("link")
      .leftJoinAndSelect("link.user", "user")
      .leftJoinAndSelect("link.chat", "chat")
      .where("link.chat = :chat", { chat: chatId })
      .andWhere("link.verified = true")
      .getMany();
    const participantIds: number[] = existLinks.map((link) => link.user.id);

    const users: User[] = await this.userServiceSupport.findUsers(participantIds, name, skip, take);
    const userDtos = users.map((user) => {
      return plainToClass(UserBriefOutDto, user, { excludeExtraneousValues: true });
    });
    return new UserBriefPageOutDto(userDtos, take, skip);
  }

  async uploadAvatar(userId: number, chatId: number, avatar: Express.Multer.File) {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_CHAT_INFO);

    const fileName: string = avatar.originalname;
    const contentType: string = avatar.mimetype;

    if (fileName.length > File.NAME_LENGTH) {
      throw new BadRequestException("Слишком длинное название файла");
    }

    if (fileName.length > File.NAME_LENGTH) {
      throw new BadRequestException("Слишком длинный тип файла");
    }

    if (!contentType.includes("jpg")
      && !contentType.includes("jpeg")
      && !contentType.includes("png")) {
      throw new BadRequestException("Недопустимый тип файла. Допустимые: png, jpg, jpeg");
    }

    const file: File = new File();
    file.uuid = uuidv4();
    file.name = fileName;
    file.contentType = contentType;

    await writeFile(join(process.cwd(), "upload", file.uuid), avatar.buffer,  "binary", function(err) {
      if(err) {
        throw new InternalServerErrorException(err, "Ошибка при загрузке файла");
      }
    });

    if (chat.avatar != null) {
      await rm(join(process.cwd(), "upload", chat.avatar.uuid), function (err) {
        if(err) {
          throw new InternalServerErrorException(err, "Ошибка при загрузке файла");
        }
      })

      chat.avatar.uuid = file.uuid;
      chat.avatar.name = file.name;
      chat.avatar.contentType = file.contentType;
    } else {
      chat.avatar = file;
    }
    this.chatServiceSupport.updateChat(chat);
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

  private setTypeAndPassword(chat: Chat, password: string, type: ChatType): void {
    chat.type = type;
    if (type == ChatType.PROTECTED) {
      chat.password = SecurityUtil.hashPassword(password);
      chat.dateTimePasswordChange = new Date();
    }
  }
}

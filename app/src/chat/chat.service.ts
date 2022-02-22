import {BadRequestException, Injectable, InternalServerErrorException, Logger} from "@nestjs/common";
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
import {plainToClass} from "class-transformer";
import {ChatBriefOutDto} from "./dto/chat-brief-out.dto";
import {ChatPageOutDto} from "./dto/chat-page-out.dto";
import {ChatOutDto} from "./dto/chat-out.dto";
import {ChatUpdateInDto} from "./dto/chat-update-in.dto";
import {ChatUserOutDto} from "./dto/chat-user-out.dto";
import {UserBriefOutDto} from "./dto/user-brief-out-dto";
import {UserBriefPageOutDto} from "./dto/user-brief-page-out-dto";
import {ChatUserPageOutDto} from "./dto/chat-user-page-out-dto";
import {writeFile} from "fs";
import {join} from "path";
import {chatAvatarsPath} from "../constants";
import {uuid} from "uuidv4";
import {ChatGateway} from "./chat.gateway";
import {ChangeType, ChatChange} from "./model/chat-change.entity";

@Injectable()
export class ChatService {

  constructor(
    @InjectRepository(Chat) private readonly chatRepository: Repository<Chat>,
    @InjectRepository(UserChatLink) private readonly userChatLinkRepository: Repository<UserChatLink>,
    private readonly userServiceSupport: UsersServiceSupport,
    private readonly chatServiceSupport: ChatServiceSupport,
    private readonly chatGateway: ChatGateway,
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
    this.setTypeAndPassword(chat, dto.password, dto.type);
    await this.chatRepository.save(chat);
    Logger.log(`Chat [id=${chat.id}] was created`);

    const userChatLink = this.createUserChatLink(chat, user, UserChatRole.OWNER);
    await this.userChatLinkRepository.save(userChatLink);
    Logger.log(`Link for user[id=${userId}] and chat[id=${chat.id}] was created`);

    const chatChange: ChatChange = this.mapToChatChange(chat, user, ChangeType.CREATION, null);
    this.chatGateway.sendSpecificMessages([chatChange], chat, [userChatLink]);

    return new ChatCreateOutDto(chat.id, this.chatServiceSupport.getChatAvatarPath(chat));
  }

  async getOrCreateDirectChat(userId: number, secondUserId: number): Promise<ChatBriefOutDto> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const secondUser: User = await this.userServiceSupport.findById(secondUserId);

    let directChatLink: UserChatLink = await this.getOrCreateDirectChatLink(user, secondUser);
    return this.chatServiceSupport.mapToChatBriefDto(directChatLink);
  }

  async addParticipants(userId: number, chatId: number, userIds: number[]): Promise<void> {
    if (userIds.length < 1) {
      return ;
    }

    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.ADD_PARTICIPANT);

    // Вытащим id уже подписаных неверифицированных пользователей через их подписки на выбранный чат
    const existLinks: UserChatLink[] = await this.userChatLinkRepository
      .createQueryBuilder("link")
      .leftJoinAndSelect("link.user", "user")
      .leftJoinAndSelect("link.chat", "chat")
      .where("link.chat = :chat", { chat: chatId })
      .andWhere("link.verified = false")
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

    notLinkedUsers.forEach(user => Logger.log(`Participant [id=${user.id}] was added to chat[id=${chatId}]`));

    const users: User[] = [...existLinks.map(link => link.user), ...notLinkedUsers];
    const chatChanges: ChatChange[] = users.map(targetUser => {
      return this.mapToChatChange(chat, user, ChangeType.ADD_PARTICIPANT, targetUser);
    });

    this.chatGateway.sendSpecificMessages(chatChanges, chat, userChatLinks);
  }

  async deleteParticipant(userId: number, chatId: number, participantId: number): Promise<void> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.ADD_PARTICIPANT);

    const participant: User = await this.userServiceSupport.findById(participantId, "Участник не найден");
    const participantChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(participant, chat);

    const chatChange: ChatChange = this.mapToChatChange(chat, user, ChangeType.REMOVE_PARTICIPANT, participant);
    this.chatGateway.sendSpecificMessages([chatChange], chat);
    Logger.log(`Participant [id=${participantId} was deleted from chat [id=${chatId}]]`);

    await this.userChatLinkRepository.delete(participantChatLink.id);
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

    const chatChange = this.mapToChatChange(chat, user, ChangeType.UPDATE_ACCESS, null);
    this.chatGateway.refreshChat(chat, chatChange);
  }

  async updateChat(userId: number, chatId: number, dto: ChatUpdateInDto): Promise<void> {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_CHAT_INFO);

    if (await this.chatServiceSupport.existsChatName(dto.name, chat)) {
      throw new BadRequestException("Чат с таким названием уже существует");
    }

    const chatChanges: ChatChange[] = [];
    if (chat.name != dto.name) {
      chat.name = dto.name;
      chatChanges.push(this.mapToChatChange(chat, user, ChangeType.UPDATE_NAME, null));
    }
    if (chat.description != dto.description) {
      chat.description = dto.description == null || dto.description.length == 0 ? null : dto.description;
      chatChanges.push(this.mapToChatChange(chat, user, ChangeType.UPDATE_DESCRIPTION, null));
    }
    await this.chatRepository.save(chat);

    Logger.log(`Chat[id=${chat.id}] was updated]`);

    this.chatGateway.sendSpecificMessages(chatChanges, chat);
  }

  async blockUserMessages(
    userId: number,
    targetUserId: number,
    block: boolean,
  ) {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const targetUser: User = await this.userServiceSupport.findById(targetUserId);

    let directChatLink: UserChatLink = await this.getOrCreateDirectChatLink(targetUser, user);
    if ((directChatLink.userStatus == UserChatStatus.ACTIVE && block)
      || (directChatLink.userStatus == UserChatStatus.MUTED && !block)) {

      directChatLink.userStatus = block ? UserChatStatus.MUTED : UserChatStatus.ACTIVE;
      this.userChatLinkRepository.save(directChatLink);
      Logger.log(`User[${user.username}] block=${block} user[${targetUser.username}]`);

      const chatChange = this.mapToChatChange(directChatLink.chat, user, ChangeType.UPDATE_CHAT_USER, targetUser);
      this.chatGateway.refreshChat(directChatLink.chat, chatChange, directChatLink);
    }
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

    if (chat.type == ChatType.DIRECT) {
      throw new BadRequestException("Invalid action for direct chats");
    }

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

    participantChatLink.userStatus = dto.status;
    participantChatLink.userRole = dto.role;
    participantChatLink.dateTimeBlockExpire = dateTimeBlockExpire;
    await this.userChatLinkRepository.save(participantChatLink);
    Logger.log(`Participant [id=${participantId}] was updated [status=${dto.status}, role=${dto.role}] in chat[id=${chat.id}]`);

    const chatChange = this.mapToChatChange(chat, user, ChangeType.UPDATE_CHAT_USER, participant);
    this.chatGateway.refreshChat(chat, chatChange, participantChatLink);
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

    let userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat, false);
    if (chat.type == ChatType.PRIVATE && (userChatLink == null || !userChatLink.verified)) {
      throw new BadRequestException("Вступить в приватный чат нельзя");
    }

    if (userChatLink == null) {
      userChatLink = this.createUserChatLink(chat, user);
    } else if (userChatLink.verified) {
      return;
    }
    userChatLink.verified = true;
    await this.userChatLinkRepository.save(userChatLink);
    Logger.log(`User [id=${userId}] joined in chat[id=${chat.id}]`);

    const chatChange: ChatChange = this.mapToChatChange(chat, user, ChangeType.JOIN_CHAT, null);
    this.chatGateway.sendSpecificMessages([chatChange], chat, [userChatLink]);
  }

  async leaveChat(userId: number, chatId: number) {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);

    if (chat.type == ChatType.DIRECT) {
      throw new BadRequestException("Leave direct chat imposible");
    }

    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
    let chatChange: ChatChange;
    if (userChatLink.chat.type == ChatType.PRIVATE) {
      await this.userChatLinkRepository.delete(userChatLink.id);
      chatChange = this.mapToChatChange(chat, user, ChangeType.LEAVE_PRIVATE_CHAT, null);
      this.chatGateway.sendSpecificMessages([chatChange], chat);
    } else if (userChatLink.verified) {
      userChatLink.verified = false;
      await this.userChatLinkRepository.save(userChatLink);
      chatChange = this.mapToChatChange(chat, user, ChangeType.LEAVE_CHAT, null);
      this.chatGateway.sendSpecificMessages([chatChange], chat);
    }

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
        dto.avatar = this.chatServiceSupport.getChatAvatarPath(chat);
        const link = linkByChatId.get(chat.id);
        if (link != null) {
          dto.userChatRole = link.userRole;
          dto.userChatStatus = link.userStatus;
          dto.dateTimeBlockExpire = link.dateTimeBlockExpire;
          dto.verified = link.verified;
        }
        return dto;
      });
    } else {
      const userChatLinks: UserChatLink[] = await this.chatServiceSupport.filterUserChatLinks(user, null, name, null, true, take, skip);
      chatDtos = userChatLinks.map((link) => this.chatServiceSupport.mapToChatBriefDto(link));
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
      userDto.avatar = UsersServiceSupport.getUserAvatarPath(link.user);
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
      const dto: UserBriefOutDto = plainToClass(UserBriefOutDto, user, { excludeExtraneousValues: true });
      dto.avatar = UsersServiceSupport.getUserAvatarPath(user);
      return dto;
    });
    return new UserBriefPageOutDto(userDtos, take, skip);
  }

  async uploadAvatar(userId: number, chatId: number, avatar: Express.Multer.File) {
    const user: User = await this.userServiceSupport.getCurrentUser(userId);
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const userChatLink: UserChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);

    ChatServiceSupport.verifyAction(userChatLink, ChatAction.UPDATE_CHAT_INFO);

    const contentType: string = avatar.mimetype;

    let extension: string;
    if (contentType.includes("jpg") || contentType.includes("jpeg") || contentType.includes("png")) {
      extension = "jpeg";
    } else {
      throw new BadRequestException("Недопустимый тип файла. Допустимые: png, jpg, jpeg");
    }

    const fileName: string = `${chatId}.${extension}`;

    await writeFile(join(chatAvatarsPath, fileName), avatar.buffer,  "binary", function(err) {
      if(err) {
        throw new InternalServerErrorException(err, "Ошибка при загрузке файла");
      }
    });

    chat.avatar = fileName;
    this.chatServiceSupport.updateChat(chat);

    const chatChange: ChatChange = this.mapToChatChange(chat, user, ChangeType.UPDATE_AVATAR, null);
    this.chatGateway.sendSpecificMessages([chatChange], chat);
  }

  private createUserChatLink(
    chat: Chat,
    user: User,
    userRole: UserChatRole = UserChatRole.PARTICIPANT,
    secondUser: User = null
  ): UserChatLink {
    const userChatLink = new UserChatLink();
    userChatLink.user = user;
    userChatLink.secondUser = secondUser;
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

  private mapToChatChange(chat: Chat, user: User, type: ChangeType, targetUser: User | null) {
    const chatChange = new ChatChange();
    chatChange.changedChat = chat;
    chatChange.changerUser = user;
    chatChange.type = type;
    chatChange.targetUser = targetUser;
    return chatChange;
  }

  private async getOrCreateDirectChatLink(user: User, secondUser: User): Promise<UserChatLink> {
    let directChatLink: UserChatLink = await this.chatServiceSupport.findDirectChatLink(user, secondUser);
    if (directChatLink == null) {
      const chat: Chat = new Chat();
      chat.ownerUser = user;
      chat.name = uuid();
      chat.type = ChatType.DIRECT;
      await this.chatRepository.save(chat);
      Logger.log(`Direct chat [id=${chat.id}] was created`);

      const userChatLink = this.createUserChatLink(chat, user, UserChatRole.ADMIN, secondUser);
      const secondUserChatLink = this.createUserChatLink(chat, secondUser, UserChatRole.ADMIN, user);
      await this.userChatLinkRepository.save([userChatLink, secondUserChatLink]);
      Logger.log(`Links for users [${user.id}, ${secondUser.id}] and direct chat[id=${chat.id}] was created`);

      directChatLink = userChatLink;
    }

    return directChatLink;
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const chat_entity_1 = require("./model/chat.entity");
const typeorm_2 = require("typeorm");
const user_chat_link_entity_1 = require("./model/user-chat-link.entity");
const security_util_1 = require("../util/security.util");
const chat_create_out_dto_1 = require("./dto/chat-create-out.dto");
const users_service_support_1 = require("../users/users.service-support");
const chat_service_support_1 = require("./chat.service-support");
const class_transformer_1 = require("class-transformer");
const chat_brief_out_dto_1 = require("./dto/chat-brief-out.dto");
const chat_page_out_dto_1 = require("./dto/chat-page-out.dto");
const chat_out_dto_1 = require("./dto/chat-out.dto");
const chat_user_out_dto_1 = require("./dto/chat-user-out.dto");
const user_brief_out_dto_1 = require("./dto/user-brief-out-dto");
const user_brief_page_out_dto_1 = require("./dto/user-brief-page-out-dto");
const chat_user_page_out_dto_1 = require("./dto/chat-user-page-out-dto");
const uuid_1 = require("uuid");
const fs_1 = require("fs");
const path_1 = require("path");
const constants_1 = require("../constants");
let ChatService = class ChatService {
    constructor(chatRepository, userChatLinkRepository, userServiceSupport, chatServiceSupport) {
        this.chatRepository = chatRepository;
        this.userChatLinkRepository = userChatLinkRepository;
        this.userServiceSupport = userServiceSupport;
        this.chatServiceSupport = chatServiceSupport;
    }
    async createChat(dto, userId) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        if (await this.chatServiceSupport.existsChatName(dto.name, null)) {
            throw new common_1.BadRequestException("Чат с таким названием уже существует");
        }
        const chat = new chat_entity_1.Chat();
        chat.ownerUser = user;
        chat.name = dto.name;
        chat.description = dto.description;
        chat.dateTimeLastAction = new Date();
        this.setTypeAndPassword(chat, dto.password, dto.type);
        await this.chatRepository.save(chat);
        common_1.Logger.log(`Chat [id=${chat.id}] was created`);
        const userChatLink = this.createUserChatLink(chat, user, user_chat_link_entity_1.UserChatRole.OWNER);
        await this.userChatLinkRepository.save(userChatLink);
        common_1.Logger.log(`Link for user[id=${userId}] and chat[id=${chat.id}] was created`);
        return new chat_create_out_dto_1.ChatCreateOutDto(chat.id);
    }
    async createDirectChat(userId, targetUserId) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const targetUser = await this.userServiceSupport.findById(targetUserId);
        const chat = new chat_entity_1.Chat();
        chat.ownerUser = user;
        chat.name = (0, uuid_1.v4)();
        chat.type = chat_entity_1.ChatType.DIRECT;
        chat.dateTimeLastAction = new Date();
        await this.chatRepository.save(chat);
        common_1.Logger.log(`Direct chat [id=${chat.id}] was created`);
        const userChatLink = this.createUserChatLink(chat, user, user_chat_link_entity_1.UserChatRole.ADMIN);
        const targetUserChatLink = this.createUserChatLink(chat, targetUser, user_chat_link_entity_1.UserChatRole.ADMIN);
        await this.userChatLinkRepository.save([userChatLink, targetUserChatLink]);
        common_1.Logger.log(`Links for users [${userId}, ${targetUser.id}] and direct chat[id=${chat.id}] was created`);
        return new chat_create_out_dto_1.ChatCreateOutDto(chat.id);
    }
    async addParticipants(userId, chatId, userIds) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.ADD_PARTICIPANT);
        const existLinks = await this.userChatLinkRepository
            .createQueryBuilder("link")
            .leftJoinAndSelect("link.user", "user")
            .leftJoinAndSelect("link.chat", "chat")
            .where("link.chat = :chat", { chat: chatId })
            .andWhere("link.user IN (:...users)", { users: userIds })
            .getMany();
        const linkedUserIds = existLinks.map((link) => link.user.id);
        existLinks.forEach((link) => link.verified = true);
        await this.userChatLinkRepository.save(existLinks);
        const notLinkedUserIds = userIds.filter((id) => !linkedUserIds.includes(id));
        const notLinkedUsers = await this.userServiceSupport.findByIds(notLinkedUserIds);
        const userChatLinks = notLinkedUsers.map((user) => {
            return this.createUserChatLink(chat, user, user_chat_link_entity_1.UserChatRole.PARTICIPANT);
        });
        await this.userChatLinkRepository.save(userChatLinks);
        chat.dateTimeLastAction = new Date();
        await this.chatServiceSupport.updateChat(chat);
        notLinkedUsers.forEach(user => common_1.Logger.log(`Participant [id=${user.id}] was added to chat[id=${chatId}]`));
    }
    async deleteParticipant(userId, chatId, participantId) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.ADD_PARTICIPANT);
        const participant = await this.userServiceSupport.findById(participantId, "Участник не найден");
        const participantChatLink = await this.chatServiceSupport.findUserChatLink(participant, chat);
        participantChatLink.verified = false;
        await this.userChatLinkRepository.save(participantChatLink);
        common_1.Logger.log(`Participant [id=${participantId} was disabled in chat [id=${chatId}]]`);
    }
    async updateAccess(userId, chatId, dto) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.UPDATE_ACCESS);
        this.setTypeAndPassword(chat, dto.password, dto.type);
        await this.chatServiceSupport.updateChat(chat);
        if (dto.dropVerification) {
            const userChatLinks = await this.userChatLinkRepository.find({ chat: chat, userRole: user_chat_link_entity_1.UserChatRole.PARTICIPANT });
            userChatLinks.forEach((link) => {
                link.verified = false;
            });
            await this.userChatLinkRepository.save(userChatLinks);
        }
        common_1.Logger.log(`Password for chat[id=${chat.id}] was updated]`);
    }
    async updateChat(userId, chatId, dto) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.UPDATE_CHAT_INFO);
        if (await this.chatServiceSupport.existsChatName(dto.name, chat)) {
            throw new common_1.BadRequestException("Чат с таким названием уже существует");
        }
        chat.name = dto.name;
        chat.description = dto.description == null || dto.description.length == 0 ? null : dto.description;
        await this.chatRepository.save(chat);
        common_1.Logger.log(`Chat[id=${chat.id}] was updated]`);
    }
    async updateUserChatRole(userId, chatId, participantId, dto) {
        if (userId == participantId) {
            throw new common_1.BadRequestException("Нельзя изменить роль самому себе");
        }
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.UPDATE_ROLE);
        const participant = await this.userServiceSupport.findById(participantId, "Участник чата не найден");
        const participantChatLink = await this.chatServiceSupport.findUserChatLink(participant, chat);
        participantChatLink.userRole = dto.role;
        await this.userChatLinkRepository.save(participantChatLink);
        common_1.Logger.log(`Participant [id=${participantId}] became ${dto.role} in chat[id=${chat.id}]`);
    }
    async updateUserChat(userId, chatId, participantId, dto) {
        let dateTimeBlockExpire;
        if (dto.dateTimeBlockExpire != null) {
            dateTimeBlockExpire = new Date(dto.dateTimeBlockExpire);
            if (dateTimeBlockExpire < new Date()) {
                throw new common_1.BadRequestException("Дата окончания блокировки не должна быть позже текущей");
            }
        }
        if (userId == participantId) {
            throw new common_1.BadRequestException("Нельзя изменить статус самому себе");
        }
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        const participant = await this.userServiceSupport.findById(participantId, "Участник чата не найден");
        const participantChatLink = await this.chatServiceSupport.findUserChatLink(participant, chat);
        if (participantChatLink.userRole != dto.role) {
            chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.UPDATE_ROLE);
        }
        else if (participantChatLink.userStatus != dto.status
            || participantChatLink.dateTimeBlockExpire != dto.dateTimeBlockExpire) {
            chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.UPDATE_STATUS);
        }
        else {
            return;
        }
        if (chat.type == chat_entity_1.ChatType.DIRECT) {
            userChatLink.userStatus = dto.status != user_chat_link_entity_1.UserChatStatus.ACTIVE ? user_chat_link_entity_1.UserChatStatus.MUTED : dto.status;
            await this.userChatLinkRepository.save(userChatLink);
            common_1.Logger.log(`User[id=${userId}] blocked user[id=${participantId}]`);
        }
        else {
            participantChatLink.userStatus = dto.status;
            participantChatLink.dateTimeBlockExpire = dateTimeBlockExpire;
            await this.userChatLinkRepository.save(participantChatLink);
            common_1.Logger.log(`Participant [id=${participantId}] was ${dto.status} in chat[id=${chat.id}]`);
        }
    }
    async joinChat(userId, chatId, password) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        if (chat.type == chat_entity_1.ChatType.DIRECT) {
            throw new common_1.BadRequestException("Вступить в личный чат нельзя");
        }
        if (chat.type == chat_entity_1.ChatType.PROTECTED) {
            if (password == null) {
                throw new common_1.BadRequestException("Необходимо ввести пароль");
            }
            else if (!security_util_1.SecurityUtil.checkPassword(password, chat.password)) {
                throw new common_1.BadRequestException("Неверный пароль");
            }
        }
        let userChatLink = await this.userChatLinkRepository.findOne({ chat: chat, user: user });
        if (!userChatLink) {
            if (chat.type == chat_entity_1.ChatType.PRIVATE) {
                throw new common_1.BadRequestException("Вступить в приватный чат нельзя");
            }
            userChatLink = this.createUserChatLink(chat, user);
            chat.dateTimeLastAction = new Date();
            await this.chatServiceSupport.updateChat(chat);
        }
        userChatLink.verified = true;
        await this.userChatLinkRepository.save(userChatLink);
        common_1.Logger.log(`User [id=${userId}] joined in chat[id=${chat.id}]`);
    }
    async leaveChat(userId, chatId) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        userChatLink.verified = false;
        await this.userChatLinkRepository.save(userChatLink);
        common_1.Logger.log(`User [id=${userId}] left(disable self) chat[id=${chat.id}]`);
    }
    async getUserChats(userId, name, global, take, skip) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        let chatDtos;
        if (global) {
            const chats = await this.chatServiceSupport.findChats(name, take, skip);
            const linkByChatId = new Map();
            (await this.chatServiceSupport.findUserChatLinksByChats(user, chats)).forEach((link) => {
                linkByChatId.set(link.chat.id, link);
            });
            chatDtos = chats.map((chat) => {
                const dto = (0, class_transformer_1.plainToClass)(chat_brief_out_dto_1.ChatBriefOutDto, chat, { excludeExtraneousValues: true });
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
        }
        else {
            const userChatLinks = await this.chatServiceSupport.filterUserChatLinks(user, null, name, null, true, take, skip);
            chatDtos = userChatLinks.map((link) => {
                const dto = (0, class_transformer_1.plainToClass)(chat_brief_out_dto_1.ChatBriefOutDto, link.chat, { excludeExtraneousValues: true });
                dto.userChatRole = link.userRole;
                dto.userChatStatus = link.userStatus;
                dto.dateTimeBlockExpire = link.dateTimeBlockExpire;
                dto.verified = link.verified;
                dto.avatar = this.chatServiceSupport.getChatAvatarPath(link.chat);
                return dto;
            });
        }
        return new chat_page_out_dto_1.ChatPageOutDto(chatDtos, take, skip);
    }
    async getChat(userId, chatId) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        let userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat, false);
        if (userChatLink == null) {
            userChatLink = new user_chat_link_entity_1.UserChatLink();
            userChatLink.chat = chat;
        }
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.CHAT_INFO);
        const chatDto = (0, class_transformer_1.plainToClass)(chat_out_dto_1.ChatOutDto, chat, { excludeExtraneousValues: true });
        chatDto.avatar = this.chatServiceSupport.getChatAvatarPath(chat);
        chatDto.userCount = await this.userChatLinkRepository.count({ chat: chat, verified: true });
        return chatDto;
    }
    async getChatUsers(userId, name, chatId, take, skip) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.CHAT_INFO);
        const userChatLinks = await this.chatServiceSupport.filterUserChatLinks(null, chat, null, name, true, take, skip);
        const users = userChatLinks.map((link) => {
            const userDto = (0, class_transformer_1.plainToClass)(chat_user_out_dto_1.ChatUserOutDto, link.user, { excludeExtraneousValues: true });
            userDto.userChatRole = link.userRole;
            userDto.userChatStatus = link.userStatus;
            userDto.dateTimeBlockExpire = link.dateTimeBlockExpire;
            userDto.verified = link.verified;
            return userDto;
        });
        return new chat_user_page_out_dto_1.ChatUserPageOutDto(users, take, skip);
    }
    async findNotParticipants(userId, chatId, name, take, skip) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.ADD_PARTICIPANT);
        const existLinks = await this.userChatLinkRepository
            .createQueryBuilder("link")
            .leftJoinAndSelect("link.user", "user")
            .leftJoinAndSelect("link.chat", "chat")
            .where("link.chat = :chat", { chat: chatId })
            .andWhere("link.verified = true")
            .getMany();
        const participantIds = existLinks.map((link) => link.user.id);
        const users = await this.userServiceSupport.findUsers(participantIds, name, skip, take);
        const userDtos = users.map((user) => {
            return (0, class_transformer_1.plainToClass)(user_brief_out_dto_1.UserBriefOutDto, user, { excludeExtraneousValues: true });
        });
        return new user_brief_page_out_dto_1.UserBriefPageOutDto(userDtos, take, skip);
    }
    async uploadAvatar(userId, chatId, avatar) {
        const user = await this.userServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat);
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.UPDATE_CHAT_INFO);
        const contentType = avatar.mimetype;
        let extension;
        if (contentType.includes("jpg")) {
            extension = "jpg";
        }
        else if (contentType.includes("jpeg")) {
            extension = "jpeg";
        }
        else if (contentType.includes("png")) {
            extension = "png";
        }
        else {
            throw new common_1.BadRequestException("Недопустимый тип файла. Допустимые: png, jpg, jpeg");
        }
        const fileName = `${chatId}.${extension}`;
        await (0, fs_1.writeFile)((0, path_1.join)(constants_1.chatAvatarsPath, fileName), avatar.buffer, "binary", function (err) {
            if (err) {
                throw new common_1.InternalServerErrorException(err, "Ошибка при загрузке файла");
            }
        });
        chat.avatar = fileName;
        this.chatServiceSupport.updateChat(chat);
    }
    createUserChatLink(chat, user, userRole = user_chat_link_entity_1.UserChatRole.PARTICIPANT) {
        const userChatLink = new user_chat_link_entity_1.UserChatLink();
        userChatLink.user = user;
        userChatLink.chat = chat;
        userChatLink.userRole = userRole;
        userChatLink.userStatus = user_chat_link_entity_1.UserChatStatus.ACTIVE;
        userChatLink.verified = true;
        return userChatLink;
    }
    setTypeAndPassword(chat, password, type) {
        chat.type = type;
        if (type == chat_entity_1.ChatType.PROTECTED) {
            chat.password = security_util_1.SecurityUtil.hashPassword(password);
            chat.dateTimePasswordChange = new Date();
        }
    }
};
ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(1, (0, typeorm_1.InjectRepository)(user_chat_link_entity_1.UserChatLink)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_support_1.UsersServiceSupport,
        chat_service_support_1.ChatServiceSupport])
], ChatService);
exports.ChatService = ChatService;
//# sourceMappingURL=chat.service.js.map
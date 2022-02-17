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
var ChatServiceSupport_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServiceSupport = exports.ChatAction = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_chat_link_entity_1 = require("./model/user-chat-link.entity");
const typeorm_2 = require("typeorm");
const chat_entity_1 = require("./model/chat.entity");
var ChatAction;
(function (ChatAction) {
    ChatAction[ChatAction["CHAT_INFO"] = 0] = "CHAT_INFO";
    ChatAction[ChatAction["ADD_PARTICIPANT"] = 1] = "ADD_PARTICIPANT";
    ChatAction[ChatAction["UPDATE_CHAT_INFO"] = 2] = "UPDATE_CHAT_INFO";
    ChatAction[ChatAction["UPDATE_STATUS"] = 3] = "UPDATE_STATUS";
    ChatAction[ChatAction["UPDATE_ROLE"] = 4] = "UPDATE_ROLE";
    ChatAction[ChatAction["UPDATE_ACCESS"] = 5] = "UPDATE_ACCESS";
    ChatAction[ChatAction["RECEIVE_MESSAGE"] = 6] = "RECEIVE_MESSAGE";
    ChatAction[ChatAction["SEND_MESSAGE"] = 7] = "SEND_MESSAGE";
    ChatAction[ChatAction["ENTER_CHAT"] = 8] = "ENTER_CHAT";
})(ChatAction = exports.ChatAction || (exports.ChatAction = {}));
let ChatServiceSupport = ChatServiceSupport_1 = class ChatServiceSupport {
    constructor(userChatLinkRepository, chatRepository) {
        this.userChatLinkRepository = userChatLinkRepository;
        this.chatRepository = chatRepository;
    }
    async findChatById(id) {
        const chat = await this.chatRepository.findOne(id, {
            relations: ["ownerUser"],
        });
        if (!chat) {
            throw new common_1.NotFoundException("Чат не найден");
        }
        return chat;
    }
    async findUserChatLink(user, chat, throwExc = true) {
        const userChatLink = await this.userChatLinkRepository.findOne({
            where: {
                chat: chat,
                user: user,
            },
            relations: ["chat", "user"],
        });
        if (!userChatLink && throwExc) {
            throw new common_1.NotFoundException("Подписка на чат не найдена");
        }
        return userChatLink;
    }
    async filterUserChatLinks(user, chat, chatname, username, verified, take, skip) {
        const qb = this.userChatLinkRepository
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
    async findSecondChatLink(user, chat) {
        const userChatLinks = await this.userChatLinkRepository.createQueryBuilder("link")
            .leftJoinAndSelect("link.user", "user")
            .leftJoinAndSelect("link.chat", "chat")
            .where("link.chat = :chat", { chat: chat.id })
            .andWhere("link.user != :user", { user: user.id })
            .getMany();
        if (userChatLinks.length != 2) {
            throw new common_1.InternalServerErrorException("userChatLinks.length not 2");
        }
        return userChatLinks[0];
    }
    async updateChat(chat) {
        await this.chatRepository.save(chat);
        common_1.Logger.log(`Chat[id=${chat.id}] was updated`);
    }
    async existsChatName(chatName, chat) {
        let found = await this.chatRepository.findOne({
            where: {
                name: (0, typeorm_2.ILike)(chatName),
            },
        });
        if (chat != null && found != null && found.id == chat.id) {
            found = null;
        }
        return found != null;
    }
    async findChats(name, take, skip) {
        return await this.chatRepository.find({
            where: {
                name: (0, typeorm_2.ILike)(name + "%"),
                type: (0, typeorm_2.Not)(chat_entity_1.ChatType.PRIVATE),
            },
            take: take,
            skip: skip,
        });
    }
    async unblockUserChatLinks(dateExpire) {
        await this.userChatLinkRepository.createQueryBuilder()
            .update()
            .set({ userStatus: user_chat_link_entity_1.UserChatStatus.ACTIVE, dateTimeBlockExpire: null })
            .andWhere("userStatus IN (:...statuses)", { statuses: [user_chat_link_entity_1.UserChatStatus.MUTED, user_chat_link_entity_1.UserChatStatus.BANNED] })
            .andWhere("dateTimeBlockExpire IS NOT null")
            .andWhere("dateTimeBlockExpire < :date", { date: dateExpire })
            .execute();
    }
    static verifyAction(userChatLink, action) {
        const roles = ChatServiceSupport_1.ROLES.get(action);
        const statuses = ChatServiceSupport_1.STATUSES.get(action);
        const types = ChatServiceSupport_1.TYPES.get(action);
        const verifications = ChatServiceSupport_1.VERIFICATIONS.get(action);
        const chat = userChatLink.chat;
        if (!verifications.includes(userChatLink.verified)) {
            throw new common_1.BadRequestException("Подписка на чат неактивна");
        }
        if (!roles.includes(userChatLink.userRole) || !statuses.includes(userChatLink.userStatus)) {
            throw new common_1.BadRequestException("Недостаточно прав");
        }
        if (!types.includes(chat.type)) {
            throw new common_1.BadRequestException("Невозможное действие для чата");
        }
    }
    async findUserChatLinksByChats(user, chats) {
        return await this.userChatLinkRepository.find({
            where: {
                user: user,
                chat: (0, typeorm_2.In)(chats.map(chat => chat.id)),
            },
            relations: ["chat"],
        });
    }
    getChatAvatarPath(chat) {
        if (chat.avatar != null) {
            return `http://localhost:3000/files/chat/${chat.avatar}`;
        }
        return `http://localhost:3000/files/chat/default.png`;
    }
};
ChatServiceSupport.ROLES = new Map();
ChatServiceSupport.STATUSES = new Map();
ChatServiceSupport.TYPES = new Map();
ChatServiceSupport.VERIFICATIONS = new Map();
(() => {
    ChatServiceSupport_1.ROLES.set(ChatAction.CHAT_INFO, [user_chat_link_entity_1.UserChatRole.OWNER, user_chat_link_entity_1.UserChatRole.ADMIN, user_chat_link_entity_1.UserChatRole.PARTICIPANT, null, undefined]);
    ChatServiceSupport_1.ROLES.set(ChatAction.ADD_PARTICIPANT, [user_chat_link_entity_1.UserChatRole.OWNER, user_chat_link_entity_1.UserChatRole.ADMIN]);
    ChatServiceSupport_1.ROLES.set(ChatAction.UPDATE_CHAT_INFO, [user_chat_link_entity_1.UserChatRole.OWNER, user_chat_link_entity_1.UserChatRole.ADMIN]);
    ChatServiceSupport_1.ROLES.set(ChatAction.UPDATE_STATUS, [user_chat_link_entity_1.UserChatRole.OWNER, user_chat_link_entity_1.UserChatRole.ADMIN]);
    ChatServiceSupport_1.ROLES.set(ChatAction.UPDATE_ROLE, [user_chat_link_entity_1.UserChatRole.OWNER]);
    ChatServiceSupport_1.ROLES.set(ChatAction.UPDATE_ACCESS, [user_chat_link_entity_1.UserChatRole.OWNER]);
    ChatServiceSupport_1.ROLES.set(ChatAction.RECEIVE_MESSAGE, [user_chat_link_entity_1.UserChatRole.OWNER, user_chat_link_entity_1.UserChatRole.ADMIN, user_chat_link_entity_1.UserChatRole.PARTICIPANT, null, undefined]);
    ChatServiceSupport_1.ROLES.set(ChatAction.SEND_MESSAGE, [user_chat_link_entity_1.UserChatRole.OWNER, user_chat_link_entity_1.UserChatRole.ADMIN, user_chat_link_entity_1.UserChatRole.PARTICIPANT]);
    ChatServiceSupport_1.ROLES.set(ChatAction.ENTER_CHAT, [user_chat_link_entity_1.UserChatRole.OWNER, user_chat_link_entity_1.UserChatRole.ADMIN, user_chat_link_entity_1.UserChatRole.PARTICIPANT, null, undefined]);
    ChatServiceSupport_1.STATUSES.set(ChatAction.CHAT_INFO, [user_chat_link_entity_1.UserChatStatus.ACTIVE, user_chat_link_entity_1.UserChatStatus.MUTED, null, undefined]);
    ChatServiceSupport_1.STATUSES.set(ChatAction.ADD_PARTICIPANT, [user_chat_link_entity_1.UserChatStatus.ACTIVE]);
    ChatServiceSupport_1.STATUSES.set(ChatAction.UPDATE_CHAT_INFO, [user_chat_link_entity_1.UserChatStatus.ACTIVE]);
    ChatServiceSupport_1.STATUSES.set(ChatAction.UPDATE_STATUS, [user_chat_link_entity_1.UserChatStatus.ACTIVE]);
    ChatServiceSupport_1.STATUSES.set(ChatAction.UPDATE_ROLE, [user_chat_link_entity_1.UserChatStatus.ACTIVE]);
    ChatServiceSupport_1.STATUSES.set(ChatAction.UPDATE_ACCESS, [user_chat_link_entity_1.UserChatStatus.ACTIVE]);
    ChatServiceSupport_1.STATUSES.set(ChatAction.RECEIVE_MESSAGE, [user_chat_link_entity_1.UserChatStatus.ACTIVE, user_chat_link_entity_1.UserChatStatus.MUTED, null, undefined]);
    ChatServiceSupport_1.STATUSES.set(ChatAction.SEND_MESSAGE, [user_chat_link_entity_1.UserChatStatus.ACTIVE]);
    ChatServiceSupport_1.STATUSES.set(ChatAction.ENTER_CHAT, [user_chat_link_entity_1.UserChatStatus.ACTIVE, user_chat_link_entity_1.UserChatStatus.MUTED, null, undefined]);
    ChatServiceSupport_1.TYPES.set(ChatAction.CHAT_INFO, [chat_entity_1.ChatType.PUBLIC, chat_entity_1.ChatType.PROTECTED, chat_entity_1.ChatType.PRIVATE]);
    ChatServiceSupport_1.TYPES.set(ChatAction.ADD_PARTICIPANT, [chat_entity_1.ChatType.PUBLIC, chat_entity_1.ChatType.PROTECTED, chat_entity_1.ChatType.PRIVATE]);
    ChatServiceSupport_1.TYPES.set(ChatAction.UPDATE_CHAT_INFO, [chat_entity_1.ChatType.PUBLIC, chat_entity_1.ChatType.PROTECTED, chat_entity_1.ChatType.PRIVATE]);
    ChatServiceSupport_1.TYPES.set(ChatAction.UPDATE_STATUS, [chat_entity_1.ChatType.PUBLIC, chat_entity_1.ChatType.PROTECTED, chat_entity_1.ChatType.PRIVATE, chat_entity_1.ChatType.DIRECT]);
    ChatServiceSupport_1.TYPES.set(ChatAction.UPDATE_ROLE, [chat_entity_1.ChatType.PUBLIC, chat_entity_1.ChatType.PROTECTED, chat_entity_1.ChatType.PRIVATE]);
    ChatServiceSupport_1.TYPES.set(ChatAction.UPDATE_ACCESS, [chat_entity_1.ChatType.PUBLIC, chat_entity_1.ChatType.PROTECTED, chat_entity_1.ChatType.PRIVATE]);
    ChatServiceSupport_1.TYPES.set(ChatAction.RECEIVE_MESSAGE, [chat_entity_1.ChatType.PUBLIC, chat_entity_1.ChatType.PROTECTED, chat_entity_1.ChatType.PRIVATE, chat_entity_1.ChatType.DIRECT]);
    ChatServiceSupport_1.TYPES.set(ChatAction.SEND_MESSAGE, [chat_entity_1.ChatType.PUBLIC, chat_entity_1.ChatType.PROTECTED, chat_entity_1.ChatType.PRIVATE, chat_entity_1.ChatType.DIRECT]);
    ChatServiceSupport_1.TYPES.set(ChatAction.ENTER_CHAT, [chat_entity_1.ChatType.PUBLIC, chat_entity_1.ChatType.PROTECTED, chat_entity_1.ChatType.PRIVATE, chat_entity_1.ChatType.DIRECT]);
    ChatServiceSupport_1.VERIFICATIONS.set(ChatAction.CHAT_INFO, [true, false, null, undefined]);
    ChatServiceSupport_1.VERIFICATIONS.set(ChatAction.ADD_PARTICIPANT, [true]);
    ChatServiceSupport_1.VERIFICATIONS.set(ChatAction.UPDATE_CHAT_INFO, [true]);
    ChatServiceSupport_1.VERIFICATIONS.set(ChatAction.UPDATE_STATUS, [true]);
    ChatServiceSupport_1.VERIFICATIONS.set(ChatAction.UPDATE_ROLE, [true]);
    ChatServiceSupport_1.VERIFICATIONS.set(ChatAction.UPDATE_ACCESS, [true]);
    ChatServiceSupport_1.VERIFICATIONS.set(ChatAction.RECEIVE_MESSAGE, [true, false, null, undefined]);
    ChatServiceSupport_1.VERIFICATIONS.set(ChatAction.SEND_MESSAGE, [true]);
    ChatServiceSupport_1.VERIFICATIONS.set(ChatAction.ENTER_CHAT, [true, false, null, undefined]);
})();
ChatServiceSupport = ChatServiceSupport_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_chat_link_entity_1.UserChatLink)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatServiceSupport);
exports.ChatServiceSupport = ChatServiceSupport;
//# sourceMappingURL=chat.service-support.js.map
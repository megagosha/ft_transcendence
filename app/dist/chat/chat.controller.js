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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const chat_service_1 = require("./chat.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_decarator_1 = require("../util/user.decarator");
const chat_create_out_dto_1 = require("./dto/chat-create-out.dto");
const chat_create_in_dto_1 = require("./dto/chat-create-in.dto");
const chat_access_update_in_dto_1 = require("./dto/chat-access-update-in.dto");
const chat_user_update_in_dto_1 = require("./dto/chat-user-update-in.dto");
const chat_user_role_update_in_dto_1 = require("./dto/chat-user-role-update-in.dto");
const chat_page_out_dto_1 = require("./dto/chat-page-out.dto");
const chat_out_dto_1 = require("./dto/chat-out.dto");
const chat_update_in_dto_1 = require("./dto/chat-update-in.dto");
const chat_user_out_dto_1 = require("./dto/chat-user-out.dto");
const user_brief_page_out_dto_1 = require("./dto/user-brief-page-out-dto");
const platform_express_1 = require("@nestjs/platform-express");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async createChat(dto, userId) {
        return await this.chatService.createChat(dto, userId);
    }
    async createPrivateChat(targetUserId, userId) {
        return this.chatService.createDirectChat(userId, targetUserId);
    }
    async findNotParticipants(chatId, name, take, skip, userId) {
        return this.chatService.findNotParticipants(userId, chatId, name, take, skip);
    }
    async addParticipants(chatId, userIds, userId) {
        await this.chatService.addParticipants(userId, chatId, userIds);
    }
    async deleteParticipant(chatId, participantId, userId) {
        await this.chatService.deleteParticipant(userId, chatId, participantId);
    }
    async updateChat(chatId, dto, userId) {
        await this.chatService.updateChat(userId, chatId, dto);
    }
    async updateAccess(chatId, dto, userId) {
        await this.chatService.updateAccess(userId, chatId, dto);
    }
    async updateUserChatRole(chatId, participantId, dto, userId) {
        await this.chatService.updateUserChatRole(userId, chatId, participantId, dto);
    }
    async updateUserChat(chatId, participantId, dto, userId) {
        await this.chatService.updateUserChat(userId, chatId, participantId, dto);
    }
    async joinChat(chatId, password, userId) {
        await this.chatService.joinChat(userId, chatId, password);
    }
    async leaveChat(chatId, userId) {
        await this.chatService.leaveChat(userId, chatId);
    }
    async getChats(name, global, take, skip, userId) {
        return this.chatService.getUserChats(userId, name, global, take, skip);
    }
    async getChat(chatId, userId) {
        return this.chatService.getChat(userId, chatId);
    }
    async getChatUsers(chatId, name, take, skip, userId) {
        return this.chatService.getChatUsers(userId, name, chatId, take, skip);
    }
    async uploadFile(chatId, avatar, userId) {
        this.chatService.uploadAvatar(userId, chatId, avatar);
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Создать публичный/защищенный чат" }),
    (0, swagger_1.ApiBody)({ description: "Данные чата", type: chat_create_in_dto_1.ChatCreateInDto }),
    (0, swagger_1.ApiResponse)({ description: "Id чата", status: common_1.HttpStatus.CREATED, type: chat_create_out_dto_1.ChatCreateOutDto }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_create_in_dto_1.ChatCreateInDto, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createChat", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Создать приватный чат" }),
    (0, swagger_1.ApiResponse)({ description: "Id чата", status: common_1.HttpStatus.CREATED, type: chat_create_out_dto_1.ChatCreateOutDto }),
    (0, common_1.Post)("private/user/:targetUserId"),
    __param(0, (0, common_1.Param)(":targetUserId", common_1.ParseIntPipe)),
    __param(1, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createPrivateChat", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Получить пользователей не являющихся участниками чата" }),
    (0, swagger_1.ApiResponse)({ description: "Страница пользователей", status: common_1.HttpStatus.OK, type: user_brief_page_out_dto_1.UserBriefPageOutDto }),
    (0, common_1.Get)(":chatId/not-participants"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("name")),
    __param(2, (0, common_1.Query)("take", common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)("skip", common_1.ParseIntPipe)),
    __param(4, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "findNotParticipants", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Добавить учатсников в чат" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, swagger_1.ApiQuery)({ name: "userIds", description: "Id пользователей", example: [1, 2, 3], type: [Number], required: true }),
    (0, common_1.Post)(":chatId/participants"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("userIds", new common_1.ParseArrayPipe({ items: Number, separator: "," }))),
    __param(2, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "addParticipants", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Удалить участника из чата" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, swagger_1.ApiQuery)({ name: "userId", description: "Id пользователя", example: 1, required: true }),
    (0, common_1.Delete)(":chatId/participant/:participantId"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)("participantId", common_1.ParseIntPipe)),
    __param(2, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteParticipant", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Обновить чат" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, swagger_1.ApiBody)({ description: "Обновленные данные чата", type: chat_update_in_dto_1.ChatUpdateInDto }),
    (0, common_1.Put)(":chatId"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, chat_update_in_dto_1.ChatUpdateInDto, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateChat", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Обновить пароль. Добавить/удалить/изменить" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, swagger_1.ApiBody)({ description: "Пароль чата", type: chat_access_update_in_dto_1.ChatAccessUpdateInDto }),
    (0, common_1.Put)(":chatId/access"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, chat_access_update_in_dto_1.ChatAccessUpdateInDto, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateAccess", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Изменить роль участника чате" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, swagger_1.ApiParam)({ name: "participantId", description: "Id участника", example: 1, required: true }),
    (0, swagger_1.ApiBody)({ description: "Роль пользователя в чате", type: chat_user_role_update_in_dto_1.ChatUserRoleUpdateInDto }),
    (0, common_1.Put)(":chatId/participant/:participantId/role"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)("participantId", common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, chat_user_role_update_in_dto_1.ChatUserRoleUpdateInDto, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateUserChatRole", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Изменить участника чата" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, swagger_1.ApiParam)({ name: "participantId", description: "Id участника", example: 1, required: true }),
    (0, swagger_1.ApiBody)({ description: "Данные о пользователе в чате", type: chat_user_update_in_dto_1.ChatUserUpdateInDto }),
    (0, common_1.Put)(":chatId/participant/:participantId"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)("participantId", common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, chat_user_update_in_dto_1.ChatUserUpdateInDto, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateUserChat", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Вступить в чат" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, swagger_1.ApiQuery)({ name: "pass", description: "Пароль чата", example: "password", required: false }),
    (0, common_1.Post)(":chatId/join"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("password")),
    __param(2, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "joinChat", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Покинуть чат" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, common_1.Post)(":chatId/leave"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "leaveChat", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Получить чаты пользователя с пагинацией" }),
    (0, swagger_1.ApiQuery)({ name: "name", description: "Наименование чата", example: "Ping-Pong", required: true }),
    (0, swagger_1.ApiQuery)({ name: "global", description: "Поиск чатов свои/глобально", example: true, required: true }),
    (0, swagger_1.ApiQuery)({ name: "take", description: "Размер страницы", example: 5, required: true }),
    (0, swagger_1.ApiQuery)({ name: "skip", description: "Номер страницы", example: 0, required: true }),
    (0, swagger_1.ApiResponse)({ description: "Страница краткой информации о чатах", status: common_1.HttpStatus.OK, type: chat_page_out_dto_1.ChatPageOutDto }),
    (0, common_1.Get)("my"),
    __param(0, (0, common_1.Query)("name")),
    __param(1, (0, common_1.Query)("global", common_1.ParseBoolPipe)),
    __param(2, (0, common_1.Query)("take", common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)("skip", common_1.ParseIntPipe)),
    __param(4, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChats", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Получить чат по его id" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, swagger_1.ApiResponse)({ description: "Подробная информация о чате", status: common_1.HttpStatus.OK, type: chat_out_dto_1.ChatOutDto }),
    (0, common_1.Get)(":chatId"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChat", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Получить всех пользователей чата" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, swagger_1.ApiResponse)({ description: "Пользователи", status: common_1.HttpStatus.OK, type: [chat_user_out_dto_1.ChatUserOutDto] }),
    (0, common_1.Get)(":chatId/participants"),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)("name")),
    __param(2, (0, common_1.Query)("take", common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)("skip", common_1.ParseIntPipe)),
    __param(4, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatUsers", null);
__decorate([
    (0, swagger_1.ApiOperation)({ description: "Загрузить аватарку чата" }),
    (0, swagger_1.ApiParam)({ name: "chatId", description: "Id чата", example: 1, required: true }),
    (0, common_1.Post)(':chatId/avatar/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        limits: { fileSize: 10000000, files: 1 }
    })),
    __param(0, (0, common_1.Param)("chatId", common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Number]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "uploadFile", null);
ChatController = __decorate([
    (0, swagger_1.ApiTags)("chat"),
    (0, common_1.Controller)("/api/chat"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
exports.ChatController = ChatController;
//# sourceMappingURL=chat.controller.js.map
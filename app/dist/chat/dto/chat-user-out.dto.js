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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatUserOutDto = void 0;
const class_transformer_1 = require("class-transformer");
const user_entity_1 = require("../../users/user.entity");
const user_chat_link_entity_1 = require("../model/user-chat-link.entity");
const swagger_1 = require("@nestjs/swagger");
class ChatUserOutDto {
}
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ description: "Id", example: 1 }),
    __metadata("design:type", Number)
], ChatUserOutDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ description: "Username", example: "username" }),
    __metadata("design:type", String)
], ChatUserOutDto.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({
        description: "Электронная почта",
        example: "username@example.com",
    }),
    __metadata("design:type", String)
], ChatUserOutDto.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({
        description: "Статус пользователя в приложении",
        example: user_entity_1.UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], ChatUserOutDto.prototype, "status", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({
        description: "Дата последнего логина",
        example: new Date(),
    }),
    __metadata("design:type", Date)
], ChatUserOutDto.prototype, "lastLoginDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Статус пользователя в чате",
        example: user_chat_link_entity_1.UserChatStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], ChatUserOutDto.prototype, "userChatStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Дата окончания блокирование",
        example: new Date(),
    }),
    __metadata("design:type", Date)
], ChatUserOutDto.prototype, "dateTimeBlockExpire", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Роль пользователя в чате",
        example: user_chat_link_entity_1.UserChatRole.ADMIN,
    }),
    __metadata("design:type", String)
], ChatUserOutDto.prototype, "userChatRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Верификация",
        example: true,
    }),
    __metadata("design:type", Boolean)
], ChatUserOutDto.prototype, "verified", void 0);
exports.ChatUserOutDto = ChatUserOutDto;
//# sourceMappingURL=chat-user-out.dto.js.map
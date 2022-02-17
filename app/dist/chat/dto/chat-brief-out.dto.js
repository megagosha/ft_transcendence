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
exports.ChatBriefOutDto = void 0;
const chat_entity_1 = require("../model/chat.entity");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const user_chat_link_entity_1 = require("../model/user-chat-link.entity");
class ChatBriefOutDto {
}
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ description: "Id чата", example: 1 }),
    __metadata("design:type", Number)
], ChatBriefOutDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({ name: "Название", example: "Мой первый чат" }),
    __metadata("design:type", String)
], ChatBriefOutDto.prototype, "name", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, swagger_1.ApiProperty)({
        name: "Тип чата",
        enum: chat_entity_1.ChatType,
        example: chat_entity_1.ChatType.PRIVATE,
    }),
    __metadata("design:type", String)
], ChatBriefOutDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Путь аватарки",
        example: "/api/chat/1/avatar",
    }),
    __metadata("design:type", String)
], ChatBriefOutDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Статус пользователя в чате",
        example: user_chat_link_entity_1.UserChatStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], ChatBriefOutDto.prototype, "userChatStatus", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Дата окончания блокирование",
        example: new Date(),
    }),
    __metadata("design:type", Date)
], ChatBriefOutDto.prototype, "dateTimeBlockExpire", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Роль пользователя в чате",
        example: user_chat_link_entity_1.UserChatRole.ADMIN,
    }),
    __metadata("design:type", String)
], ChatBriefOutDto.prototype, "userChatRole", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Верификация",
        example: true,
    }),
    __metadata("design:type", Boolean)
], ChatBriefOutDto.prototype, "verified", void 0);
exports.ChatBriefOutDto = ChatBriefOutDto;
//# sourceMappingURL=chat-brief-out.dto.js.map
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
exports.ChatUserUpdateInDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_chat_link_entity_1 = require("../model/user-chat-link.entity");
class ChatUserUpdateInDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Роль пользователя в чате",
        example: user_chat_link_entity_1.UserChatRole.ADMIN,
        required: true,
    }),
    (0, class_validator_1.IsEnum)(user_chat_link_entity_1.UserChatRole, {
        message: "Необходимо указать роль пользователя в чате",
    }),
    __metadata("design:type", String)
], ChatUserUpdateInDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Статус пользователя в чате",
        example: user_chat_link_entity_1.UserChatStatus.MUTED,
        required: true,
    }),
    (0, class_validator_1.IsEnum)(user_chat_link_entity_1.UserChatStatus, {
        message: "Необходимо указать статус пользователя в чате",
    }),
    __metadata("design:type", String)
], ChatUserUpdateInDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Дата окончания блокировки. Если дата не указана пользователь блокируется бессрочно",
        example: new Date(),
        required: false,
    }),
    (0, class_validator_1.ValidateIf)((dto) => dto.dateTimeBlockExpire != null),
    __metadata("design:type", Date)
], ChatUserUpdateInDto.prototype, "dateTimeBlockExpire", void 0);
exports.ChatUserUpdateInDto = ChatUserUpdateInDto;
//# sourceMappingURL=chat-user-update-in.dto.js.map
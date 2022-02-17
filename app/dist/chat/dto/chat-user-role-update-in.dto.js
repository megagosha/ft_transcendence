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
exports.ChatUserRoleUpdateInDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const user_chat_link_entity_1 = require("../model/user-chat-link.entity");
class ChatUserRoleUpdateInDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        description: "Роль пользователя в чате",
        example: user_chat_link_entity_1.UserChatRole.ADMIN,
        required: true,
    }),
    (0, class_validator_1.IsEnum)(user_chat_link_entity_1.UserChatRole, { message: "Необходимо указать роль пользователя в чате" }),
    __metadata("design:type", String)
], ChatUserRoleUpdateInDto.prototype, "role", void 0);
exports.ChatUserRoleUpdateInDto = ChatUserRoleUpdateInDto;
//# sourceMappingURL=chat-user-role-update-in.dto.js.map
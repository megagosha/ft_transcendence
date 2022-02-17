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
exports.ChatCreateInDto = void 0;
const class_validator_1 = require("class-validator");
const chat_entity_1 = require("../model/chat.entity");
const swagger_1 = require("@nestjs/swagger");
class ChatCreateInDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        name: "Тип чата",
        required: true,
        enum: chat_entity_1.ChatType,
        example: chat_entity_1.ChatType.PRIVATE,
    }),
    (0, class_validator_1.IsEnum)(chat_entity_1.ChatType, { message: "Тип чата не указан" }),
    (0, class_validator_1.NotEquals)(chat_entity_1.ChatType.DIRECT, { message: "Нельзя создать личный чат" }),
    __metadata("design:type", String)
], ChatCreateInDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        name: "Название",
        required: true,
        minLength: 1,
        maxLength: chat_entity_1.Chat.NAME_LENGTH,
        example: "Мой первый чат",
    }),
    (0, class_validator_1.Length)(1, chat_entity_1.Chat.NAME_LENGTH, {
        message: `Название чата должно иметь длину от 1 до ${chat_entity_1.Chat.NAME_LENGTH} символов`,
    }),
    __metadata("design:type", String)
], ChatCreateInDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        name: "Описание",
        required: false,
        minLength: 1,
        maxLength: chat_entity_1.Chat.DESCRIPTION_LENGTH,
        example: "Чат о пинг-понге",
    }),
    (0, class_validator_1.ValidateIf)((dto) => dto.description != null),
    (0, class_validator_1.Length)(1, chat_entity_1.Chat.DESCRIPTION_LENGTH, {
        message: `Описание чата должно иметь длину от 1 до ${chat_entity_1.Chat.DESCRIPTION_LENGTH} символов`,
    }),
    __metadata("design:type", String)
], ChatCreateInDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        name: "Пароль",
        required: false,
        minLength: 5,
        example: "password",
    }),
    (0, class_validator_1.ValidateIf)((dto) => dto.type === chat_entity_1.ChatType.PROTECTED),
    (0, class_validator_1.IsNotEmpty)({ message: "Пароль чата не указан" }),
    (0, class_validator_1.MinLength)(5, { message: `Пароль должно иметь длину от 5 символов` }),
    __metadata("design:type", String)
], ChatCreateInDto.prototype, "password", void 0);
exports.ChatCreateInDto = ChatCreateInDto;
//# sourceMappingURL=chat-create-in.dto.js.map
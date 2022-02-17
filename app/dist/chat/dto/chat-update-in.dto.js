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
exports.ChatUpdateInDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const chat_entity_1 = require("../model/chat.entity");
const class_validator_1 = require("class-validator");
class ChatUpdateInDto {
}
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
], ChatUpdateInDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        name: "Описание",
        required: false,
        minLength: 1,
        maxLength: chat_entity_1.Chat.DESCRIPTION_LENGTH,
        example: "Чат о пинг-понге",
    }),
    (0, class_validator_1.ValidateIf)((dto) => dto.description != null),
    (0, class_validator_1.MaxLength)(chat_entity_1.Chat.DESCRIPTION_LENGTH, {
        message: `Описание чата должно иметь длину до ${chat_entity_1.Chat.DESCRIPTION_LENGTH} символов`,
    }),
    __metadata("design:type", String)
], ChatUpdateInDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        name: "Аватарка. Id файла в хранилище",
        example: 1,
        required: false,
    }),
    (0, class_validator_1.ValidateIf)((dto) => dto.avatarFileId != null),
    (0, class_validator_1.IsNumber)({}, { message: "Некорректный формат аватарки" }),
    __metadata("design:type", Number)
], ChatUpdateInDto.prototype, "avatarFileId", void 0);
exports.ChatUpdateInDto = ChatUpdateInDto;
//# sourceMappingURL=chat-update-in.dto.js.map
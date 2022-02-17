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
exports.MessageOutDto = void 0;
const chat_user_out_dto_1 = require("./chat-user-out.dto");
const class_transformer_1 = require("class-transformer");
const chat_brief_out_dto_1 = require("./chat-brief-out.dto");
class MessageOutDto {
}
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], MessageOutDto.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], MessageOutDto.prototype, "text", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], MessageOutDto.prototype, "dateTimeSend", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Date)
], MessageOutDto.prototype, "dateTimeEdit", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => chat_user_out_dto_1.ChatUserOutDto),
    __metadata("design:type", chat_user_out_dto_1.ChatUserOutDto)
], MessageOutDto.prototype, "authorUser", void 0);
__decorate([
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => chat_brief_out_dto_1.ChatBriefOutDto),
    __metadata("design:type", chat_brief_out_dto_1.ChatBriefOutDto)
], MessageOutDto.prototype, "targetChat", void 0);
exports.MessageOutDto = MessageOutDto;
//# sourceMappingURL=message-out.dto.js.map
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
exports.ChatPageOutDto = void 0;
const chat_brief_out_dto_1 = require("./chat-brief-out.dto");
const swagger_1 = require("@nestjs/swagger");
class ChatPageOutDto {
    constructor(chats, take, skip) {
        this.chats = chats;
        this.take = take;
        this.skip = skip;
    }
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Краткая информация о чатах", type: [chat_brief_out_dto_1.ChatBriefOutDto] }),
    __metadata("design:type", Array)
], ChatPageOutDto.prototype, "chats", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Размер страницы", example: 5 }),
    __metadata("design:type", Number)
], ChatPageOutDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "Номер страницы", example: 0 }),
    __metadata("design:type", Number)
], ChatPageOutDto.prototype, "skip", void 0);
exports.ChatPageOutDto = ChatPageOutDto;
//# sourceMappingURL=chat-page-out.dto.js.map
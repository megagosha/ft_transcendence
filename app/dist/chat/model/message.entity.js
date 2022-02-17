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
var Message_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/user.entity");
const chat_entity_1 = require("./chat.entity");
let Message = Message_1 = class Message {
};
Message.TEXT_LENGTH = 2000;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Message.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)(),
    __metadata("design:type", Number)
], Message.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "text", length: Message_1.TEXT_LENGTH, nullable: false }),
    __metadata("design:type", String)
], Message.prototype, "text", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: "datetime_send",
        nullable: false,
        update: false,
        insert: false,
    }),
    __metadata("design:type", Date)
], Message.prototype, "dateTimeSend", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "datetime_edit", nullable: true }),
    __metadata("design:type", Date)
], Message.prototype, "dateTimeEdit", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "author_user_id", referencedColumnName: "id" }),
    __metadata("design:type", user_entity_1.User)
], Message.prototype, "authorUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "visible", nullable: false, default: true }),
    __metadata("design:type", Boolean)
], Message.prototype, "visible", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_entity_1.Chat, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "target_chat_id", referencedColumnName: "id" }),
    __metadata("design:type", chat_entity_1.Chat)
], Message.prototype, "targetChat", void 0);
Message = Message_1 = __decorate([
    (0, typeorm_1.Entity)("ft_message", { orderBy: { dateTimeSend: "DESC" } })
], Message);
exports.Message = Message;
//# sourceMappingURL=message.entity.js.map
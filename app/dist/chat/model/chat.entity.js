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
var Chat_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Chat = exports.ChatType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/user.entity");
var ChatType;
(function (ChatType) {
    ChatType["PROTECTED"] = "PROTECTED";
    ChatType["PUBLIC"] = "PUBLIC";
    ChatType["PRIVATE"] = "PRIVATE";
    ChatType["DIRECT"] = "DIRECT";
})(ChatType = exports.ChatType || (exports.ChatType = {}));
let Chat = Chat_1 = class Chat {
};
Chat.NAME_LENGTH = 50;
Chat.TYPE_LENGTH = 10;
Chat.PASSWORD_LENGTH = 60;
Chat.DESCRIPTION_LENGTH = 500;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Chat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)(),
    __metadata("design:type", Number)
], Chat.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "name", length: Chat_1.NAME_LENGTH, nullable: false }),
    __metadata("design:type", String)
], Chat.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "description",
        length: Chat_1.DESCRIPTION_LENGTH,
        nullable: true,
    }),
    __metadata("design:type", String)
], Chat.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "datetime_create", nullable: false, update: false }),
    __metadata("design:type", Date)
], Chat.prototype, "dateTimeCreate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "type",
        length: Chat_1.TYPE_LENGTH,
        nullable: false,
    }),
    __metadata("design:type", String)
], Chat.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "password",
        length: Chat_1.PASSWORD_LENGTH,
        nullable: true,
    }),
    __metadata("design:type", String)
], Chat.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "datetime_password_change",
        nullable: true,
    }),
    __metadata("design:type", Date)
], Chat.prototype, "dateTimePasswordChange", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "avatar", nullable: true }),
    __metadata("design:type", String)
], Chat.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "owner_user_id", referencedColumnName: "id" }),
    __metadata("design:type", user_entity_1.User)
], Chat.prototype, "ownerUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "datetime_last_message", nullable: false }),
    __metadata("design:type", Date)
], Chat.prototype, "dateTimeLastAction", void 0);
Chat = Chat_1 = __decorate([
    (0, typeorm_1.Entity)("ft_chat"),
    (0, typeorm_1.Index)("chat_name_index", ["name"], { unique: true })
], Chat);
exports.Chat = Chat;
//# sourceMappingURL=chat.entity.js.map
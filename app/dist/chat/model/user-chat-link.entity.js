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
var UserChatLink_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserChatLink = exports.UserChatStatus = exports.UserChatRole = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/user.entity");
const chat_entity_1 = require("./chat.entity");
var UserChatRole;
(function (UserChatRole) {
    UserChatRole["OWNER"] = "OWNER";
    UserChatRole["ADMIN"] = "ADMIN";
    UserChatRole["PARTICIPANT"] = "PARTICIPANT";
})(UserChatRole = exports.UserChatRole || (exports.UserChatRole = {}));
var UserChatStatus;
(function (UserChatStatus) {
    UserChatStatus["ACTIVE"] = "ACTIVE";
    UserChatStatus["MUTED"] = "MUTED";
    UserChatStatus["BANNED"] = "BANNED";
})(UserChatStatus = exports.UserChatStatus || (exports.UserChatStatus = {}));
let UserChatLink = UserChatLink_1 = class UserChatLink {
};
UserChatLink.USER_CHAT_STATUS_LENGTH = 15;
UserChatLink.USER_CHAT_ROLE_LENGTH = 15;
UserChatLink.SUBSCRIPTION_STATUS_LENGTH = 15;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserChatLink.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "user_id", referencedColumnName: "id" }),
    __metadata("design:type", user_entity_1.User)
], UserChatLink.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "user_status",
        length: UserChatLink_1.USER_CHAT_STATUS_LENGTH,
        nullable: false,
    }),
    __metadata("design:type", String)
], UserChatLink.prototype, "userStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "user_role",
        length: UserChatLink_1.USER_CHAT_ROLE_LENGTH,
        nullable: false,
    }),
    __metadata("design:type", String)
], UserChatLink.prototype, "userRole", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_entity_1.Chat, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "chat_id", referencedColumnName: "id" }),
    __metadata("design:type", chat_entity_1.Chat)
], UserChatLink.prototype, "chat", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: "datetime_creat", nullable: false }),
    __metadata("design:type", Date)
], UserChatLink.prototype, "dateTimeCreate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "datetime_block_expire", nullable: true }),
    __metadata("design:type", Date)
], UserChatLink.prototype, "dateTimeBlockExpire", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "verified", nullable: false }),
    __metadata("design:type", Boolean)
], UserChatLink.prototype, "verified", void 0);
UserChatLink = UserChatLink_1 = __decorate([
    (0, typeorm_1.Entity)("ft_user_chat_link"),
    (0, typeorm_1.Index)("userchatlink_user_chat_index", ["user", "chat"], { unique: true })
], UserChatLink);
exports.UserChatLink = UserChatLink;
//# sourceMappingURL=user-chat-link.entity.js.map
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
var UserSocket_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSocket = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/user.entity");
const chat_entity_1 = require("./chat.entity");
let UserSocket = UserSocket_1 = class UserSocket {
};
UserSocket.ID_LENGTH = 50;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: "id",
        length: UserSocket_1.ID_LENGTH,
        nullable: false,
        unique: true,
    }),
    __metadata("design:type", String)
], UserSocket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "user_id", referencedColumnName: "id" }),
    __metadata("design:type", user_entity_1.User)
], UserSocket.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_entity_1.Chat, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "active_chat_id", referencedColumnName: "id" }),
    __metadata("design:type", chat_entity_1.Chat)
], UserSocket.prototype, "activeChat", void 0);
UserSocket = UserSocket_1 = __decorate([
    (0, typeorm_1.Entity)("ft_user_socket")
], UserSocket);
exports.UserSocket = UserSocket;
//# sourceMappingURL=user-socket.entity.js.map
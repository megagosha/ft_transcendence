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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSocketServiceSupport = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_socket_entity_1 = require("./model/user-socket.entity");
const typeorm_2 = require("typeorm");
let UserSocketServiceSupport = class UserSocketServiceSupport {
    constructor(userSocketRepository) {
        this.userSocketRepository = userSocketRepository;
    }
    async addUserSocket(user, socketId) {
        const userSocket = new user_socket_entity_1.UserSocket();
        userSocket.id = socketId;
        userSocket.user = user;
        await this.userSocketRepository.save(userSocket);
        common_1.Logger.log(`Socket[id=${socketId} for user[id=${user.id}] was created`);
    }
    async removeSocket(socketId) {
        await this.userSocketRepository.delete({ id: socketId });
        common_1.Logger.log(`Socket[id=${socketId}] was removed`);
    }
    async removeAllSockets() {
        await this.userSocketRepository.clear();
        common_1.Logger.log(`All sockets were deleted`);
    }
    async removeSockets(user) {
        await this.userSocketRepository.delete({ user: user });
        common_1.Logger.log(`Sockets were deleted for user[id=${user.id}]`);
    }
    async findSocket(socketId) {
        const socket = await this.userSocketRepository.findOne(socketId, { relations: ["user", "activeChat"] });
        if (!socket) {
            throw new common_1.NotFoundException("Сокет для пользователя не найден");
        }
        return socket;
    }
    async findSockets(activeChat) {
        return this.userSocketRepository.find({ activeChat: activeChat });
    }
};
UserSocketServiceSupport = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_socket_entity_1.UserSocket)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UserSocketServiceSupport);
exports.UserSocketServiceSupport = UserSocketServiceSupport;
//# sourceMappingURL=user-socket.service-support.js.map
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
exports.GameGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const user_entity_1 = require("../users/user.entity");
const socket_exception_filter_1 = require("../chat/socket.exception-filter");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const game_service_1 = require("./game.service");
const user_service_1 = require("../users/user.service");
let GameGateway = class GameGateway {
    constructor(authService, userRepository, gameService, userService) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.gameService = gameService;
        this.userService = userService;
        common_1.Logger.log('socket constructor init');
    }
    afterInit(server) {
        common_1.Logger.log('chat gateway init');
    }
    handleConnection(client) {
        try {
            const user = this.authService.decodeJwtToken(client.handshake.auth.token);
            if (!user) {
                client.emit('Unauthorized');
                this.handleDisconnect(client);
            }
            else {
                this.gameService.newConnection(user.id, client.id);
                client.data.userId = user.id;
                client.data.username = user.username;
            }
        }
        catch (err) {
            client.emit('Unauthorized');
            this.handleDisconnect(client);
        }
    }
    handleDisconnect(client) {
        if (!client.data.userId)
            return client.disconnect();
        this.gameService.endGame(client.data.userId);
        this.gameService.removePlayer(client.data.userId);
        client.disconnect();
        return;
    }
    invitePlayer(client, data) {
        const event = 'invite_player_result';
        const res = this.gameService.invitePlayer(client.data.userId, data.userId);
        if (res.status == false)
            throw new websockets_1.WsException(res.data);
        this.server.in(res.data).emit('pending_invite', {
            userId: client.data.userId,
            username: client.data.username,
        });
        return { event: event, data: 'ok' };
    }
    joinGame(data) {
        return data;
    }
    declineInvite(data) {
        this.gameService.inviteDeclined(data.userId);
        common_1.Logger.log('invite from user ' + data.userId + ' declined');
    }
    async acceptInvite(data, client) {
        if (!this.gameService.acceptInvite(data.userId, client.data.userId))
            return { event: 'accept_invite', data: false };
        const gameRoom = data.userId.toString() + 'x' + client.data.userId.toString();
        const opponent_id = this.gameService.game.players.get(data.userId).playerSocket;
        client.rooms.clear();
        (await this.server.in(opponent_id).fetchSockets()).pop().rooms.clear();
        client.join(gameRoom);
        this.server.in(opponent_id).socketsJoin(gameRoom);
        const game = this.gameService.createNewGame(gameRoom, data.userId, client.data.userId);
        const left = game.players[data.userId].x < 10;
        let username = (await this.userService.findUser(data.userId))
            .username;
        client.emit('game_ready', data.userId, username, left);
        username = (await this.userService.findUser(client.data.userId)).username;
        this.server
            .in(opponent_id)
            .emit('game_ready', client.data.userId, username, !left);
        let userA, userB;
        if (left) {
            userA = data.userId;
            userB = client.data.userId;
        }
        else {
            userA = client.data.userId;
            userB = data.userId;
        }
        const interval = setInterval(() => {
            this.server
                .to(gameRoom)
                .emit('game_update', this.gameService.getGameUpdate(gameRoom, userA, userB));
        }, 16);
        this.gameService.game.registerInterval(gameRoom, interval);
        return { event: 'accept_invite', data: true };
    }
    async watch(data, client) {
        if (client.data.userId == data.userId)
            return;
        const gameRoom = this.gameService.game.getPlayer(data.userId);
        common_1.Logger.log(gameRoom);
        if (!gameRoom || !gameRoom.gameRoom)
            return {
                status: false,
                reason: 'Game not found',
            };
        const res = await this.gameService.getPlayersInfo(gameRoom.gameRoom);
        if (res.status == true)
            client.join(gameRoom.gameRoom);
        return res;
    }
    move(cords, client) {
        const room = this.gameService.game.findRoomId(client.data.userId);
        const game = this.gameService.game.findGame(room);
        if (!game || !game.players[client.data.userId])
            return;
        game.players[client.data.userId].y = cords.y > 100 ? 100 : cords.y;
    }
    async gameEnd(data, client) {
        if (data.userId != client.data.userId)
            throw new websockets_1.WsException('Player not found');
        let res = 0;
        const room = this.gameService.game.findRoomId(client.data.userId);
        try {
            res = await this.gameService.endGame(data.userId);
        }
        catch (e) {
            common_1.Logger.log(e);
        }
        this.server.to(room).emit('game_ended', { id: res });
        this.server.in(room).socketsLeave(room);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], GameGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('invite_player'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Object)
], GameGateway.prototype, "invitePlayer", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_game'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", String)
], GameGateway.prototype, "joinGame", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('invite_declined'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "declineInvite", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('accept_invite'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "acceptInvite", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('watch_game'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "watch", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('game_move'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], GameGateway.prototype, "move", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('game_end'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], GameGateway.prototype, "gameEnd", null);
GameGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: '/game_sock',
        transports: 'websocket',
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:4200'],
        },
    }),
    (0, common_1.UseFilters)(socket_exception_filter_1.SocketExceptionFilter),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        typeorm_2.Repository,
        game_service_1.GameService,
        user_service_1.UserService])
], GameGateway);
exports.GameGateway = GameGateway;
//# sourceMappingURL=game.gateway.js.map
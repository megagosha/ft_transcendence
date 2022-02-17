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
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/user.entity");
const typeorm_2 = require("typeorm");
const user_service_1 = require("../users/user.service");
const game_dto_1 = require("./game.dto");
const game_history_entity_1 = require("./game.history.entity");
let GameService = class GameService {
    constructor(userRepo, gameStatRepo, userService) {
        this.userRepo = userRepo;
        this.gameStatRepo = gameStatRepo;
        this.userService = userService;
        this.game = new game_dto_1.GameStorage();
    }
    invitePlayer(inviterId, invitedId) {
        const player = this.game.getPlayer(invitedId);
        if (!player)
            return { status: false, data: 'User offline' };
        if (player.gameRoom != '')
            return { status: false, data: 'Player in game' };
        this.game.userAinvitedB(inviterId, invitedId);
        return { status: true, data: player.playerSocket };
    }
    inviteDeclined(inviterId) {
        this.game.removeInvite(inviterId);
    }
    acceptInvite(inviterId, invitedId) {
        const res = this.game.waitingForAccept.get(inviterId);
        if (res != invitedId)
            return false;
        this.game.waitingForAccept.delete(inviterId);
        return true;
    }
    createNewGame(roomId, userAId, userBId) {
        const game = new game_dto_1.Game(userAId, userBId);
        game.players = {};
        game.ball = new game_dto_1.Ball(50, 50, 2, 2);
        game.players[userAId] = new game_dto_1.Player(10, 50, 1, 15);
        game.players[userBId] = new game_dto_1.Player(90, 50, 1, 15);
        this.game.saveGame(roomId, game);
        this.game.setGameRoom(userAId, roomId);
        this.game.setGameRoom(userBId, roomId);
        this.userService.setStatus(userAId, user_entity_1.UserStatus.ACTIVE);
        this.userService.setStatus(userBId, user_entity_1.UserStatus.ACTIVE);
        return game;
    }
    getGameUpdate(gameRoom, userAId, userBId) {
        const game = this.game.findGame(gameRoom);
        game.ball.move();
        game.checkCollisions(userAId, userBId);
        game.gameOver(userAId, userBId);
        return this.game.findGame(gameRoom);
    }
    async getPlayersInfo(gameRoom) {
        const game = this.game.findGame(gameRoom);
        common_1.Logger.log('service ');
        common_1.Logger.log(game);
        console.log(game.players);
        if (!game || !game.players)
            return {
                status: false,
                reason: 'Game not found',
            };
        const data = {
            status: false,
            reason: 'internal error',
            userAId: 0,
            userAUsername: '',
            userBId: 0,
            userBUsername: '',
        };
        const players = Object.keys(game.players);
        if (game.players[players[0]].x > 10) {
            const tmp = players[1];
            players[1] = players[0];
            players[0] = tmp;
        }
        data.userAId = Number(players[0]);
        data.userAUsername = (await this.userService.findUser(data.userAId)).username;
        data.userBId = Number(players[1]);
        data.userBUsername = (await this.userService.findUser(data.userBId)).username;
        if (data.userAUsername && data.userBUsername) {
            data.status = true;
            data.reason = 'ok';
        }
        return data;
    }
    async endGame(userId) {
        let res = 0;
        const playerA = this.game.players.get(userId);
        if (!playerA || !playerA.gameRoom || playerA.gameRoom == '')
            return;
        const playerB = this.game.getOpponentUserId(userId);
        console.log('opponent id : ' + playerB);
        if (playerB != 0)
            res = (await this.saveGameStat(playerA.gameRoom, userId, playerB)).id;
        this.game.unsetGameRoom(userId);
        this.game.unsetGameRoom(playerB);
        this.userService.setStatus(userId, user_entity_1.UserStatus.ONLINE);
        this.userService.setStatus(playerB, user_entity_1.UserStatus.ONLINE);
        this.game.removeInterval(playerA.gameRoom);
        this.game.games.delete(playerA.gameRoom);
        return res;
    }
    async saveGameStat(gameRoom, userA, userB) {
        const game = this.game.findGame(gameRoom);
        const res = new game_history_entity_1.GameStatistic();
        let winner;
        let loser;
        console.log('1');
        console.log(gameRoom);
        console.log('1');
        console.log(game);
        console.log(userA);
        console.log(userB);
        console.log(game.players[userA]);
        console.log(game.players[userB]);
        if (game.players[userA].score > game.players[userB].score) {
            winner = userA;
            loser = userB;
        }
        else {
            winner = userB;
            loser = userA;
        }
        res.userWon = await this.userService.findUser(winner);
        res.userLost = await this.userService.findUser(loser);
        res.score = [];
        res.score.push(game.players[loser].score);
        res.score.push(game.players[winner].score);
        const db_res = await this.gameStatRepo.save(res);
        return db_res;
    }
    removePlayer(userId) {
        this.game.players.delete(userId);
        this.game.waitingForAccept.delete(userId);
        this.userService.setStatus(userId, user_entity_1.UserStatus.OFFLINE);
    }
    newConnection(userId, socketId) {
        this.userService.setStatus(userId, user_entity_1.UserStatus.ONLINE);
        this.game.addPlayer(userId, socketId);
    }
    async getGameResult(id) {
        return await this.gameStatRepo.findOne({ id: id }, { relations: ['userWon', 'userLost'] });
    }
    async getOneOnOneHistory(userA, userB, take, skip) {
        return await this.gameStatRepo.find({
            where: [
                {
                    userLost: userA,
                    userWon: userB,
                },
                { userWon: userA, userLost: userB },
            ],
            relations: ['userWon', 'userLost'],
            take: take,
            skip: skip,
        });
    }
    async getPersonalHistory(userA, take, skip) {
        return await this.gameStatRepo.find({
            where: [
                {
                    userLost: userA,
                },
                { userWon: userA },
            ],
            relations: ['userWon', 'userLost'],
        });
    }
    async getLadder() {
        return (this.gameStatRepo
            .createQueryBuilder('game')
            .leftJoinAndSelect('game.userWon', 'user')
            .select('user.username')
            .addSelect('user.avatarImgName')
            .addSelect('game.userWonId AS userWonId')
            .addSelect('COUNT(*) AS count')
            .groupBy('game.userWonId')
            .addGroupBy('user.username')
            .addGroupBy('user.avatarImgName')
            .orderBy('count', 'DESC')
            .getRawMany());
    }
};
GameService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(game_history_entity_1.GameStatistic)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        user_service_1.UserService])
], GameService);
exports.GameService = GameService;
//# sourceMappingURL=game.service.js.map
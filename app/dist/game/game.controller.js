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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const game_service_1 = require("./game.service");
const gamestats_dto_1 = require("./gamestats.dto");
let GameController = class GameController {
    constructor(gameService) {
        this.gameService = gameService;
    }
    async gameResult(data) {
        console.log(data.id);
        if (!data.id)
            throw new common_1.NotFoundException();
        const res = await this.gameService.getGameResult(data.id);
        if (!res)
            throw new common_1.NotFoundException();
        console.log('results: ');
        console.log(res);
        return new gamestats_dto_1.GameStatsDto(res);
    }
    async getOneOnOne(data) {
        if (!data.userA || !data.userB || !data.take || !data.skip)
            throw new common_1.NotFoundException();
        const res = await this.gameService.getOneOnOneHistory(data.userA, data.userB, data.take, data.skip);
        if (!res)
            return null;
        return res;
    }
    async getPersonal(data) {
        if (!data.userId || !data.take || !data.skip)
            throw new common_1.NotFoundException();
        const res = await this.gameService.getPersonalHistory(data.userId, data.take, data.skip);
        if (!res)
            return null;
        return res;
    }
    async getGameLadder() {
        return await this.gameService.getLadder();
    }
};
__decorate([
    (0, common_1.Get)('result'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "gameResult", null);
__decorate([
    (0, common_1.Get)('one_on_one_history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getOneOnOne", null);
__decorate([
    (0, common_1.Get)('personal_history'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getPersonal", null);
__decorate([
    (0, common_1.Get)('ladder'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GameController.prototype, "getGameLadder", null);
GameController = __decorate([
    (0, swagger_1.ApiTags)('game'),
    (0, common_1.Controller)('game'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
exports.GameController = GameController;
//# sourceMappingURL=game.controller.js.map
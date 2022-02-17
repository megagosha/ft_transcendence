"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStatsDto = void 0;
class GameStatsDto {
    constructor(res) {
        this.id = res.id;
        this.userLost = {
            id: res.userLost.id,
            username: res.userLost.username,
            avatarImgName: res.userLost.avatarImgName,
            status: res.userLost.status,
        };
        this.userWon = {
            id: res.userWon.id,
            username: res.userWon.username,
            avatarImgName: res.userWon.avatarImgName,
            status: res.userWon.status,
        };
        this.score = res.score;
        this.timeEnd = res.timeEnd;
    }
}
exports.GameStatsDto = GameStatsDto;
//# sourceMappingURL=gamestats.dto.js.map
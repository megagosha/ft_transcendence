"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStorage = exports.Game = exports.Ball = exports.Player = exports.GameObject = exports.Bounds = void 0;
const common_1 = require("@nestjs/common");
class Bounds {
}
exports.Bounds = Bounds;
class GameObject {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    getBounds() {
        return {
            top: this.y - this.height / 2,
            bottom: this.y + this.height / 2,
            right: this.x + this.width / 2,
            left: this.x - this.width / 2,
        };
    }
}
exports.GameObject = GameObject;
class Player extends GameObject {
    constructor(x, y, w, h) {
        super(x, y, w, h);
        this.height = h;
        this.color = 'red';
        this.score = 0;
    }
    setPos(x, y) {
        this.x = x;
        this.y = y;
    }
}
exports.Player = Player;
class Ball extends GameObject {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.speedX = 0.5;
        this.speedY = 0.5;
        this.maxSpeed = 1;
        this.color = 'red';
    }
    bounceX() {
        this.speedX = -this.speedX;
    }
    bounceY() {
        this.speedY = -this.speedY;
    }
    move() {
        this.x += this.maxSpeed * this.speedX;
        this.y += (this.maxSpeed + 0.2) * this.speedY;
    }
}
exports.Ball = Ball;
class Game {
    constructor(userA, userB) {
        this.players = {};
        this.players[userA] = new Player(4, 50, 3, 15);
        this.players[userB] = new Player(96, 50, 3, 15);
    }
    collision(player, bounds) {
        this.ball.bounceX();
        let vsr = -(this.ball.y - player.y) / (bounds.top - player.y);
        vsr = Math.min(vsr, 1);
        common_1.Logger.log(common_1.Logger.getTimestamp() + ' vsr ' + vsr);
        this.ball.speedY = vsr;
        console.log(this.ball.speedY);
    }
    gameOver(userA, userB) {
        const ballBounds = this.ball.getBounds();
        if (ballBounds.left <= 0) {
            this.players[userB].score += 1;
        }
        else if (ballBounds.right >= 100)
            this.players[userA].score += 1;
        else
            return;
        this.ball = new Ball(50, 50, 2, 2);
    }
    checkCollisions(userA, userB) {
        const ballBounds = this.ball.getBounds();
        if (ballBounds.bottom >= 100 || ballBounds.top <= 0)
            this.ball.bounceY();
        let paddleBounds = this.players[userA].getBounds();
        if (ballBounds.left <= paddleBounds.right &&
            paddleBounds.right - ballBounds.left <= 3 &&
            ballBounds.bottom >= paddleBounds.top &&
            ballBounds.top <= paddleBounds.bottom) {
            this.collision(this.players[userA], paddleBounds);
        }
        paddleBounds = this.players[userB].getBounds();
        if (ballBounds.right - 3 <= paddleBounds.left &&
            paddleBounds.left - ballBounds.right - 3 <= 2 &&
            ballBounds.bottom >= paddleBounds.top &&
            ballBounds.top <= paddleBounds.bottom) {
            console.log(ballBounds);
            console.log(paddleBounds);
            this.collision(this.players[userB], paddleBounds);
        }
    }
}
exports.Game = Game;
class GameStorage {
    constructor() {
        this.games = new Map();
        this.players = new Map();
        this.waitingForAccept = new Map();
        this.intervals = new Map();
    }
    findGame(id) {
        return this.games.get(id);
    }
    userAinvitedB(userA, userB) {
        common_1.Logger.log('UserA ' + userA + ' waiting for accept from ' + userB);
        this.waitingForAccept.set(userA, userB);
    }
    playerDisconnect(userId) {
        const res = this.players.get(userId);
        if (res && res.gameRoom)
            this.endGameByRoomId(res.gameRoom);
        this.players.delete(userId);
    }
    endGameByRoomId(roomId) {
        const game = this.games.get(roomId);
        if (game && game.players) {
            for (const player in game.players) {
                this.players.get(Number(player)).gameRoom = '';
            }
        }
        this.games.delete(roomId);
        this.removeInterval(roomId);
    }
    unsetGameRoom(userId) {
        const roomId = this.players.get(userId);
        if (roomId && roomId.gameRoom)
            roomId.gameRoom = '';
    }
    findRoomId(userId) {
        const res = this.players.get(userId);
        if (!res)
            return '';
        return res.gameRoom;
    }
    findPlayerSocket(userId) {
        const res = this.players.get(userId);
        if (!res)
            return '';
        return res.playerSocket;
    }
    getPlayer(userId) {
        return this.players.get(userId);
    }
    saveGame(roomId, game) {
        this.games.set(roomId, game);
    }
    registerInterval(roomId, timer) {
        this.intervals.set(roomId, timer);
    }
    removeInterval(roomId) {
        clearInterval(this.intervals.get(roomId));
        this.intervals.delete(roomId);
    }
    addPlayer(userId, socketId) {
        this.players.set(userId, { playerSocket: socketId, gameRoom: '' });
    }
    setGameRoom(userId, gameId) {
        const res = this.players.get(userId);
        if (res) {
            res.gameRoom = gameId;
        }
    }
    removeInvite(inviterId) {
        this.waitingForAccept.delete(inviterId);
    }
    getOpponentUserId(userId) {
        const res = this.players.get(userId);
        console.log('a');
        if (!res || !res.gameRoom)
            return 0;
        const game = this.games.get(res.gameRoom);
        console.log('b');
        if (!game || !game.players)
            return 0;
        const players = Object.keys(game.players);
        console.log(players);
        if (Number(players[0]) != userId)
            return Number(players[0]);
        else
            return Number(players[1]);
        return 0;
    }
}
exports.GameStorage = GameStorage;
//# sourceMappingURL=game.dto.js.map
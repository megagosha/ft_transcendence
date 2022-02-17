/// <reference types="node" />
export declare class Bounds {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export declare class GameObject {
    x: number;
    y: number;
    width: any;
    height: any;
    constructor(x: number, y: number, width: any, height: any);
    getBounds(): Bounds;
}
export declare class Player extends GameObject {
    width: number;
    height: number;
    color: string;
    score: number;
    constructor(x: number, y: number, w: number, h: number);
    setPos(x: number, y: number): void;
}
export declare class Ball extends GameObject {
    color: string;
    speedX: number;
    speedY: number;
    maxSpeed: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
    bounceX(): void;
    bounceY(): void;
    move(): void;
}
export declare class Game {
    players: {
        [userId: number]: Player;
    };
    ball: Ball;
    constructor(userA: number, userB: number);
    collision(player: Player, bounds: Bounds): void;
    gameOver(userA: number, userB: number): void;
    checkCollisions(userA: number, userB: number): void;
}
export declare class GameStorage {
    games: Map<string, Game>;
    players: Map<number, {
        gameRoom: string;
        playerSocket: string;
    }>;
    waitingForAccept: Map<number, number>;
    intervals: Map<string, NodeJS.Timer>;
    constructor();
    findGame(id: string): Game;
    userAinvitedB(userA: number, userB: number): void;
    playerDisconnect(userId: number): void;
    endGameByRoomId(roomId: string): void;
    unsetGameRoom(userId: number): void;
    findRoomId(userId: number): string;
    findPlayerSocket(userId: number): string;
    getPlayer(userId: number): {
        gameRoom: string;
        playerSocket: string;
    };
    saveGame(roomId: string, game: Game): void;
    registerInterval(roomId: string, timer: NodeJS.Timer): void;
    removeInterval(roomId: string): void;
    addPlayer(userId: number, socketId: string): void;
    setGameRoom(userId: number, gameId: string): void;
    removeInvite(inviterId: number): void;
    getOpponentUserId(userId: number): number;
}

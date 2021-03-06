import { Logger } from "@nestjs/common";
import { User } from "../users/user.entity";
import { PlayerMatchDto } from "./dto/player-match.dto";
import { GameState } from "./dto/startGame.dto";

export class Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export class GameObject {
  constructor(
    public x: number,
    public y: number,
    public width,
    public height
  ) {}

  public getBounds(): Bounds {
    // let scaledX = this.x / 100 * 150;
    return {
      top: this.y - this.height / 2,
      bottom: this.y + this.height / 2,
      right: this.x + this.width / 2,
      left: this.x - this.width / 2,
    };
  }
}

export class Player extends GameObject {
  width: number;
  height: number;
  color: string;
  score: number;

  constructor(x: number, y: number, w: number, h: number, color: string) {
    super(x, y, w, h);
    this.height = h;
    this.color = color;
    this.score = 0;
  }

  setPos(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Ball extends GameObject {
  public color: string;
  public speedX: number;
  public speedY: number;
  public maxSpeed: number;
  public width: number;
  public height: number;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y, width, height);
    this.speedX = 0.5;
    this.speedY = 0.5;
    this.maxSpeed = 1;
    this.color = "orange";
  }

  bounceX(): void {
    this.speedX = -this.speedX;
  }

  bounceY(): void {
    this.speedY = -this.speedY;
  }

  move() {
    this.x += this.maxSpeed * this.speedX;
    this.y += (this.maxSpeed + 0.2) * this.speedY;
  }
}

export class Game {
  players: { [userId: number]: Player } = {};
  ball: Ball;

  constructor(userA: number, userB: number) {
    this.players[userA] = new Player(10, 50, 2, 100 * 0.15, "orange");
    this.players[userB] = new Player(90, 50, 2, 15, "orange");
  }

  collision(player: Player, bounds: Bounds) {
    this.ball.bounceX();
    let vsr = -(this.ball.y - player.y) / (bounds.top - player.y);
    vsr = Math.min(vsr, 1);
    this.ball.speedY = vsr;
  }

  gameOver(userA: number, userB: number): void {
    const ballBounds = this.ball.getBounds();
    if (ballBounds.left <= 0) {
      this.players[userB].score += 1;
    } else if (ballBounds.right >= 100) this.players[userA].score += 1;
    else return;
    this.ball = new Ball(50, 50, 2, 2);
  }

  checkCollisions(userA: number, userB: number) {
    const ballBounds = this.ball.getBounds();
    if (ballBounds.bottom >= 100 || ballBounds.top <= 0) this.ball.bounceY();

    let paddleBounds = this.players[userA].getBounds();

    if (
      ballBounds.left <= paddleBounds.right &&
      paddleBounds.right - ballBounds.left <= 3 &&
      ballBounds.bottom >= paddleBounds.top &&
      ballBounds.top <= paddleBounds.bottom
    ) {
      this.collision(this.players[userA], paddleBounds);
    }
    paddleBounds = this.players[userB].getBounds();
    if (
      ballBounds.right - 3 <= paddleBounds.left &&
      paddleBounds.left - ballBounds.right - 3 <= 2 &&
      ballBounds.bottom >= paddleBounds.top &&
      ballBounds.top <= paddleBounds.bottom
    ) {
      this.collision(this.players[userB], paddleBounds);
    }
  }
}

export class GameStorage {
  games: Map<string, GameState>; //roomId -> game obj
  players: Map<number, { gameRoom: string; playerSocket: string }>; //user_id -> game socket id;
  matchMaking: Map<number, PlayerMatchDto>;
  waitingForAccept: Map<number, number>;
  intervals: Map<string, NodeJS.Timer>;
  pause: Map<
    string,
    {
      pOne: { id: number; ready: boolean };
      pTwo: { id: number; ready: boolean };
      timer: NodeJS.Timer;
      timeSet: Date;
    }
  >;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.waitingForAccept = new Map();
    this.matchMaking = new Map();
    this.intervals = new Map();
    this.pause = new Map();
  }

  findGame(id: string): GameState {
    return this.games.get(id);
  }

  userAinvitedB(userA: number, userB: number) {
    this.waitingForAccept.set(userA, userB);
  }

  playerDisconnect(userId: number) {
    const res = this.players.get(userId);
    if (res && res.gameRoom) this.endGameByRoomId(res.gameRoom);
    this.players.delete(userId);
  }

  endGameByRoomId(roomId: string) {
    const game = this.games.get(roomId);
    if (game && game.game.players) {
      for (const player in game.game.players) {
        this.players.get(Number(player)).gameRoom = "";
      }
    }
    this.games.delete(roomId);
    this.removeInterval(roomId);
  }

  unsetGameRoom(userId: number) {
    const roomId = this.players.get(userId);
    if (roomId && roomId.gameRoom) roomId.gameRoom = "";
  }

  findRoomId(userId: number): string {
    const res = this.players.get(userId);
    if (!res) return "";
    return res.gameRoom;
  }

  findPlayerSocket(userId: number): string {
    const res = this.players.get(userId);
    if (!res) return "";
    return res.playerSocket;
  }

  getPlayer(userId: number): { gameRoom: string; playerSocket: string } {
    return this.players.get(userId);
  }

  registerInterval(roomId: string, timer: NodeJS.Timer) {
    this.intervals.set(roomId, timer);
  }

  removeInterval(roomId: string) {
    clearInterval(this.intervals.get(roomId));
    this.intervals.delete(roomId);
  }

  addPlayer(userId: number, socketId: string) {
    this.players.set(userId, { playerSocket: socketId, gameRoom: "" });
  }

  setGameRoom(userId: number, gameId: string) {
    const res = this.players.get(userId);
    if (res) {
      res.gameRoom = gameId;
    }
  }

  removeInvite(inviterId: number) {
    this.waitingForAccept.delete(inviterId);
  }

  getOpponentUserId(userId: number) {
    const res = this.players.get(userId);
    if (!res || !res.gameRoom) return 0;
    const game = this.games.get(res.gameRoom);
    if (!game || !game.game.players) return 0;
    const players = Object.keys(game.game.players);
    if (Number(players[0]) != userId) return Number(players[0]);
    else return Number(players[1]);
    return 0;
  }

  addPlayerToMatchMaking(data: PlayerMatchDto) {
    this.matchMaking.set(data.userId, data);
  }

  setGamePaused(room: string, timer: NodeJS.Timer): boolean {
    const game = this.games.get(room);
    if (!game) return false;
    game.paused = 30;
    this.pause.set(room, {
      pOne: { id: game.left.id, ready: false },
      pTwo: { id: game.right.id, ready: false },
      timer: timer,
      timeSet: new Date(),
    });
    return true;
  }

  unPausePlayer(
    room: string,
    userId: number
  ): { result: boolean; timeOut: NodeJS.Timer } {
    const res = this.pause.get(room);
    if (!res) return { result: false, timeOut: null };
    if (res.pOne.id == userId) res.pOne.ready = true;
    else {
      res.pTwo.ready = true;
    }
    if (res.pOne.ready && res.pTwo.ready) {
      this.games.get(room).paused = 0;
      return { result: true, timeOut: res.timer };
    }
    return { result: false, timeOut: null };
  }
}

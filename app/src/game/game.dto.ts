import { Logger } from '@nestjs/common';
import { stringify } from 'querystring';
import { Server, Socket } from 'socket.io';
import { User } from '../users/user.entity';

export class Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

//height - width relation -> 100/150
export class GameObject {
  // x: number;
  // y: number;
  // speed: number;
  // direction: number;

  constructor(
    public x: number,
    public y: number,
    public width,
    public height,
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

  constructor(x: number, y: number, w: number, h: number) {
    super(x, y, w, h);
    this.height = h;
    this.color = 'red';
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
    this.color = 'red';
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
    // Logger.log('x + ' + this.x);
    // Logger.log(this.y);
    // Logger.log('max ' + this.maxSpeed);
    // Logger.log(this.speedX);
    // Logger.log(this.speedY);
  }
}

export class Game {
  players: { [userId: number]: Player } = {};
  ball: Ball;

  constructor(userA: number, userB: number) {
    this.players[userA] = new Player(4, 50, 3, 15);
    this.players[userB] = new Player(96, 50, 3, 15);
  }

  collision(player: Player, bounds: Bounds) {
    this.ball.bounceX();
    // Set vertical speed ratio by taking ratio of
    // dist(centerOfBall, centerOfPaddle) to dist(topOfPaddle, centerOfPaddle)
    // Negate because pixels go up as we go down :)
    let vsr = -(this.ball.y - player.y) / (bounds.top - player.y);
    // Max vsr is 1
    vsr = Math.min(vsr, 1);
    Logger.log(Logger.getTimestamp() + ' vsr ' + vsr);
    this.ball.speedY = vsr;
    console.log(this.ball.speedY);
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
    // Logger.log('ball:');
    // Logger.log(ballBounds);
    // // console.log(ballBounds);
    // Logger.log('paddle');
    // Logger.log(paddleBounds);
    // console.log(paddleBounds);
    paddleBounds = this.players[userB].getBounds();
    if (
      ballBounds.right - 3 <= paddleBounds.left &&
      paddleBounds.left - ballBounds.right - 3 <= 2 &&
      ballBounds.bottom >= paddleBounds.top &&
      ballBounds.top <= paddleBounds.bottom
    ) {
      console.log(ballBounds);
      console.log(paddleBounds);
      this.collision(this.players[userB], paddleBounds);
    }
  }
}

export class GameStorage {
  games: Map<string, Game>; //roomId -> game obj
  players: Map<number, { gameRoom: string; playerSocket: string }>; //user_id -> game socket id;
  waitingForAccept: Map<number, number>;
  intervals: Map<string, NodeJS.Timer>;

  constructor() {
    this.games = new Map();
    this.players = new Map();
    this.waitingForAccept = new Map();
    this.intervals = new Map();
  }

  findGame(id: string): Game {
    return this.games.get(id);
  }

  userAinvitedB(userA: number, userB: number) {
    Logger.log('UserA ' + userA + ' waiting for accept from ' + userB);
    this.waitingForAccept.set(userA, userB);
  }

  playerDisconnect(userId: number) {
    const res = this.players.get(userId);
    if (res && res.gameRoom) this.endGameByRoomId(res.gameRoom);
    this.players.delete(userId);
  }

  endGameByRoomId(roomId: string) {
    const game = this.games.get(roomId);
    if (game && game.players) {
      for (const player in game.players) {
        this.players.get(Number(player)).gameRoom = '';
      }
    }
    this.games.delete(roomId);
    this.removeInterval(roomId);
  }

  unsetGameRoom(userId: number) {
    const roomId = this.players.get(userId);
    if (roomId && roomId.gameRoom) roomId.gameRoom = '';
  }

  findRoomId(userId: number): string {
    const res = this.players.get(userId);
    if (!res) return '';
    return res.gameRoom;
  }

  findPlayerSocket(userId: number): string {
    const res = this.players.get(userId);
    if (!res) return '';
    return res.playerSocket;
  }

  getPlayer(userId: number): { gameRoom: string; playerSocket: string } {
    return this.players.get(userId);
  }

  //
  // createGame(userId: number, opponentId: number): string {
  //   const roomName = userId.toString() + opponentId.toString();
  //   this.games.set(roomName, new GameDto());
  //   this.players.set(userId, roomName);
  //   this.players.set(opponentId, roomName);
  //   return roomName;
  // }

  saveGame(roomId: string, game: Game) {
    this.games.set(roomId, game);
  }

  registerInterval(roomId: string, timer: NodeJS.Timer) {
    this.intervals.set(roomId, timer);
  }

  removeInterval(roomId: string) {
    clearInterval(this.intervals.get(roomId));
    this.intervals.delete(roomId);
  }

  addPlayer(userId: number, socketId: string) {
    this.players.set(userId, { playerSocket: socketId, gameRoom: '' });
    // this.game.addPlayer(userId, roomId, socketId);
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
    console.log('a');
    if (!res || !res.gameRoom) return 0;
    const game = this.games.get(res.gameRoom);
    console.log('b');
    if (!game || !game.players) return 0;
    const players = Object.keys(game.players);
    console.log(players);
    if (Number(players[0]) != userId) return Number(players[0]);
    else return Number(players[1]);
    return 0;
  }
}

import { GameState, GameTopInfoPart } from "./game.dto";

export class Coordinates {

  constructor( public x: number, public y: number ) {
    this.x = x;
    this.y = y;
  }
}

export class AxisSpeed {
  constructor( public xSpeed: number, public ySpeed: number ) {
  }
}

export interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export abstract class GameObject {
  public color = "orange";

  constructor( public height: number, public width: number, protected maxSpeed: number, public cords: Coordinates ) {
  }

  update( speed: AxisSpeed ) {
    this.cords.x += this.maxSpeed * speed.xSpeed;
    this.cords.y += this.maxSpeed * speed.ySpeed;
  }

  public setPos( x: number, y: number ) {
    this.cords.x = x;
    this.cords.y = y;
  }

  getPos(): Coordinates {
    return this.cords;
  }

  getBoundaries(): Bounds {
    return {
      top: Math.round(this.cords.y) - this.height / 2,
      bottom: Math.round(this.cords.y) + this.height / 2,
      left: Math.round(this.cords.x) - this.width / 2,
      right: Math.round(this.cords.x) + this.width / 2
    };
  }
}

export class Ball extends GameObject {
  constructor( gameHeight: number, gameWidth: number, color: string ) {
    super(gameHeight * 0.02, gameWidth * 0.02, 2, { x: gameWidth / 2, y: gameHeight / 2 });
    this.color = color;
  }

  updateDimensions(gameWidth: number, gameHeight: number, left: boolean ) {
    this.height = 0.02 * gameHeight;
    this.width = 0.02 * gameWidth;
  }
  // bounceX(): void {
  //   this.axisSpeed.xSpeed = -this.axisSpeed.xSpeed;
  // }
  //
  // bounceY(): void {
  //   this.axisSpeed.ySpeed = -this.axisSpeed.ySpeed;
  // }
  //
  // setVSpeed( s: number ) {
  //   this.axisSpeed.ySpeed = s;
  // }
  //
  // override update() {
  //   super.update(this.axisSpeed);
  // }
}

export class Paddle extends GameObject {
  private axisSpeed: AxisSpeed;
  public score: number = 0;

  // public username: string = "";

  constructor( gameWidth: number, gameHeight: number, left: boolean, color: string) {
    super(0, 0, 10, { x: 0, y: 0 });
    this.axisSpeed = {xSpeed: 0, ySpeed: 0 }
    this.height = gameHeight * 0.15;
    this.width = gameWidth * 0.02;
    this.cords.x = left ? gameWidth * 0.1 : gameWidth * 0.90;
    this.cords.y = gameHeight / 2;
    this.color = color;
  }


  accelerate( minY: number, up: boolean ) {
    if (minY < 0 || minY > 1) return;
    if (up) {
      this.axisSpeed.ySpeed = Math.max(-1, this.axisSpeed.ySpeed - minY);
    } else
      this.axisSpeed.ySpeed = Math.min(1, this.axisSpeed.ySpeed + minY);
  }

  slowDown( minY: number ) {
    if (this.axisSpeed.ySpeed < 0) {
      this.axisSpeed.ySpeed = Math.min(this.axisSpeed.ySpeed + minY, 0);
    }
    if (this.axisSpeed.ySpeed > 0)
      this.axisSpeed.ySpeed = Math.max(this.axisSpeed.ySpeed - minY, 0);
  }

  move() {
    this.cords.x += this.maxSpeed * this.axisSpeed.xSpeed;
    this.cords.y += this.maxSpeed * this.axisSpeed.ySpeed;
  }

  updateDimensions(gameWidth: number, gameHeight: number, left: boolean ) {
    this.height = 0.15 * gameHeight;
    this.width = 0.01 * gameWidth;
    this.cords.x = left ? gameWidth * 0.1 : gameWidth* 0.90;
  }
}

export class Game {
  public ball: Ball;
  public players: { [userId: number]: Paddle } = {};
  public width: number;
  public height: number;

  constructor( width: number, height: number, gameState: GameState ) {
    this.width = width;
    this.height = height;
    this.ball = new Ball(width, height, gameState.game.ball.color);
    this.players[gameState.left.id] = new Paddle(this.width, this.height, true, gameState.game.players[gameState.left.id].color);
    this.players[gameState.right.id] = new Paddle(this.width, this.height, false, gameState.game.players[gameState.right.id].color);
  }

  updateDimensions( width: number, height: number ) {
    for (let player in this.players) {
      if (this.players[player].cords.x < this.width * 0.12)
        this.players[player].updateDimensions(width, height, true);
      else
        this.players[player].updateDimensions(width, height, false);
    }
    this.width = width;
    this.height = height;
  }

  // setPlayers(userAId: number, userAUsername: string, userBId: number, userBUsername: string, left: boolean) {
  //   let leftX = this.width * 0.1;
  //   let rightX = this.width * 0.9;
  //   this.players[userAId] = new Paddle(this.height * 0.15, this.width * 0.01, 10, { x:left ? leftX : rightX , y: this.height / 2 }, { xSpeed: 0, ySpeed: 0 });
  //   this.players[userBId] = new Paddle(this.height * 0.15, this.width * 0.01, 10, { x: left ? rightX : leftX, y: this.height / 2 }, { xSpeed: 0, ySpeed: 0 });
  //   // this.players[userAId].username = userAUsername;
  //   // this.players[userBId].username = userBUsername;
  // }
}

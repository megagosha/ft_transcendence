export class Coordinates {

  constructor(public x: number, public y: number) {
    this.x = x;
    this.y = y;
  }
}

export class AxisSpeed {
  constructor(public xSpeed: number, public ySpeed: number) {
  }
}

export interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export abstract class GameObject {
  constructor(public height: number, public width: number, protected maxSpeed: number, public cords: Coordinates) {
  }

  update(speed: AxisSpeed) {
    this.cords.x += this.maxSpeed * speed.xSpeed;
    this.cords.y += this.maxSpeed * speed.ySpeed;
  }

  public setPos(x:number, y: number)
  {
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
  private axisSpeed: AxisSpeed;

  constructor(height: number, width: number, maxSpeed: number, cords: Coordinates, axisSpeed: AxisSpeed) {
    super(height, width, maxSpeed, cords);
    this.axisSpeed = axisSpeed;
  }

  bounceX(): void {
    this.axisSpeed.xSpeed = -this.axisSpeed.xSpeed;
  }

  bounceY(): void {
    this.axisSpeed.ySpeed = -this.axisSpeed.ySpeed;
  }

  setVSpeed(s: number) {
    this.axisSpeed.ySpeed = s;
  }

  override update() {
    super.update(this.axisSpeed);
  }
}

export class Paddle extends GameObject {
  private axisSpeed: AxisSpeed;
  public score: number = 0;
  public username: string = "";

  constructor(height: number, width: number, maxSpeed: number, cords: Coordinates, axisSpeed: AxisSpeed) {
    super(height, width, maxSpeed, cords);
    this.axisSpeed = axisSpeed;
  }
  accelerate(minY: number, up: boolean) {
    // if (ratioChange < 0 || ratioChange > 1) return;
    // this.axisSpeed.ySpeed = Math.max(-3, this.axisSpeed.ySpeed - ratioChange);
    // this.cords.y += 1.5 * this.axisSpeed.ySpeed;
    // if ((this.cords.y -= 20) < minX )
    //   this.cords.y = 0;
    // else
    //   this.cords.y -= 20;

    if (minY < 0 || minY > 1) return;
    if (up) {
      this.axisSpeed.ySpeed = Math.max(-1, this.axisSpeed.ySpeed - minY);

      console.log('up');
    }
    else
      this.axisSpeed.ySpeed = Math.min(1, this.axisSpeed.ySpeed + minY);

  }

  slowDown(minY: number) {
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
}

export class Game {
  public ball: Ball;
  public players: { [userId: number]: Paddle } = {} ;
  public playerA: Paddle;
  public playerB: Paddle;
  public width: number;
  public height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.ball = new Ball(0.02*this.height, 0.02 * this.width, 2, { x: this.width / 2, y: this.height / 2 }, { xSpeed: 1, ySpeed: 1 });
    this.playerA = new Paddle(this.height * 0.15, this.width * 0.01, 10, { x: this.width * 0.1, y: this.height / 2 }, { xSpeed: 0, ySpeed: 0 });
    this.playerB = new Paddle(this.height * 0.15, this.width * 0.01, 10, { x: this.width * 0.9, y: this.height / 2 }, { xSpeed: 0, ySpeed: 0 });
  }

  setPlayers(userAId: number, userAUsername: string, userBId: number, userBUsername: string, left: boolean) {
    let leftX = this.width * 0.1;
    let rightX = this.width * 0.9;
    this.players[userAId] = new Paddle(this.height * 0.15, this.width * 0.01, 10, { x:left ? leftX : rightX , y: this.height / 2 }, { xSpeed: 0, ySpeed: 0 });
    this.players[userBId] = new Paddle(this.height * 0.15, this.width * 0.01, 10, { x: left ? rightX : leftX, y: this.height / 2 }, { xSpeed: 0, ySpeed: 0 });
    this.players[userAId].username = userAUsername;
    this.players[userBId].username = userBUsername;
  }
}

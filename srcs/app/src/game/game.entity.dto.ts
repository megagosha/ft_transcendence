import { Logger } from '@nestjs/common';
import { stringify } from 'querystring';
import { User } from '../users/user.entity';
import { GameObject, Player, Ball, Game } from './game.dto';
// export class Player {
//   paddleX: number;
//   paddleY: number;
//   win: number;
//   lose: number;
//
//   constructor(x: number, y: number) {
//     this.paddleX = x;
//     this.paddleY = y;
//     this.win = 0;
//   }
// }
//
// export class Ball {
//   ballX: number;
//   ballY: number;
//
//   constructor(x: number, y: number) {
//     this.ballX = x;
//     this.ballY = y;
//   }
// }
//
// export class GameDto {
//   roomId: string;
//   ball: Ball = new Ball(50, 50);
//   players: { [key: number]: Player };
//   ready: boolean;
// }

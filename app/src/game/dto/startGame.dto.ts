import { Game, GameStorage, Player } from "../game.dto";
import { PlayerMatchDto } from "./player-match.dto";
import { User } from "../../users/user.entity";

export interface GameDto {
  players: {
    [userId: number]: { x: number; y: number; score: number; color: string };
  };
  ball: { x: number; y: number; color: string };
}

export interface GameTopInfoPart {
  id: number;
  username: string;
  avatar: string;
  score: number;
}

export class GameState {
  left: GameTopInfoPart;
  right: GameTopInfoPart;
  game: Game;
  paused: number;

  constructor(game: Game, oneU: User, twoU: User) {
    this.game = game;
    this.paused = 0;
    (this.left = {
      id: oneU.id,
      username: oneU.username,
      avatar: oneU.avatarImgName,
      score: 0,
    }),
      (this.right = {
        id: twoU.id,
        username: twoU.username,
        avatar: twoU.avatarImgName,
        score: 0,
      });
    if (game.players[oneU.id].x > 10) {
      const tmp = this.right;
      this.right = this.left;
      this.left = tmp;
    }
  }
}

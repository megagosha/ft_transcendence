export interface GameStatsDto {
  id: number;
  userLost: {
    id: number;
    username: string;
    avatarImgName: string;
    status: string;
  };
  userWon: {
    id: number;
    username: string;
    avatarImgName: string;
    status: string;
  };
  score: number[];
  timeEnd: Date;
}

export interface GameDto {
  players: { [userId: number]: { x: number, y: number, score: number, color: string } };
  ball: { x: number, y: number, color: string };
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
  game: GameDto;
  constructor() {
    this.left = { id: 0, username: "", avatar: "", score: 0 };
    this.right = { id: 0, username: "", avatar: "", score: 0 };
    this.game = { players: [], ball: { x: 50, y: 50, color: "orange" } };
  }
}

export interface PlayerMatchDto {
  userId: number;
  paddleColor: string;
  ballColor: string;
}
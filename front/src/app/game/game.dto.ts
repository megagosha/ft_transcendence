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
  players: { [userId: number]: {x: number, y: number, score: number} };
  ball: { x: number, y: number };
}

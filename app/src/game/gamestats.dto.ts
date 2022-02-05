import { GameStatistic } from './game.history.entity';

export class GameStatsDto {
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

  constructor(res: GameStatistic) {
    this.id = res.id;
    this.userLost = {
      id: res.userLost.id,
      username: res.userLost.username,
      avatarImgName: res.userLost.avatarImgName,
      status: res.userLost.status,
    };
    this.userWon = {
      id: res.userWon.id,
      username: res.userWon.username,
      avatarImgName: res.userWon.avatarImgName,
      status: res.userWon.status,
    };
    this.score = res.score;
    this.timeEnd = res.timeEnd;
  }
}

import { GameStatistic } from './game.history.entity';
export declare class GameStatsDto {
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
    constructor(res: GameStatistic);
}

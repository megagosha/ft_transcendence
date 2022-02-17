import { User } from '../users/user.entity';
export declare class GameStatistic {
    id: number;
    userLost: User;
    userWonId: number;
    userWon: User;
    score: number[];
    timeEnd: Date;
}

import { GameService } from './game.service';
import { GameStatsDto } from './gamestats.dto';
export declare class GameController {
    private readonly gameService;
    constructor(gameService: GameService);
    gameResult(data: {
        id: number;
    }): Promise<GameStatsDto>;
    getOneOnOne(data: {
        userA: number;
        userB: number;
        take: number;
        skip: number;
    }): Promise<GameStatsDto[]>;
    getPersonal(data: {
        userId: number;
        take: number;
        skip: number;
    }): Promise<GameStatsDto[]>;
    getGameLadder(): Promise<any>;
}

import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { UserService } from '../users/user.service';
import { Game, GameStorage } from './game.dto';
import { GameStatistic } from './game.history.entity';
export declare class GameService {
    private readonly userRepo;
    private readonly gameStatRepo;
    private readonly userService;
    game: GameStorage;
    constructor(userRepo: Repository<User>, gameStatRepo: Repository<GameStatistic>, userService: UserService);
    invitePlayer(inviterId: number, invitedId: number): {
        status: boolean;
        data: string;
    };
    inviteDeclined(inviterId: number): void;
    acceptInvite(inviterId: number, invitedId: number): boolean;
    createNewGame(roomId: string, userAId: number, userBId: number): Game;
    getGameUpdate(gameRoom: string, userAId: number, userBId: number): Game;
    getPlayersInfo(gameRoom: string): Promise<{
        status: boolean;
        reason: string;
        userAId: number;
        userAUsername: string;
        userBId: number;
        userBUsername: string;
    } | {
        status: boolean;
        reason: string;
    }>;
    endGame(userId: number): Promise<number>;
    saveGameStat(gameRoom: string, userA: number, userB: number): Promise<GameStatistic>;
    removePlayer(userId: number): void;
    newConnection(userId: number, socketId: string): void;
    getGameResult(id: number): Promise<GameStatistic>;
    getOneOnOneHistory(userA: number, userB: number, take: number, skip: number): Promise<GameStatistic[]>;
    getPersonalHistory(userA: number, take: number, skip: number): Promise<GameStatistic[]>;
    getLadder(): Promise<any[]>;
}

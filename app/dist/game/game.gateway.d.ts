import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, WsResponse } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { User } from '../users/user.entity';
import { Repository } from 'typeorm';
import { GameService } from './game.service';
import { UserService } from '../users/user.service';
export declare class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly authService;
    private userRepository;
    private readonly gameService;
    private userService;
    server: Server;
    constructor(authService: AuthService, userRepository: Repository<User>, gameService: GameService, userService: UserService);
    afterInit(server: Server): void;
    handleConnection(client: Socket): any;
    handleDisconnect(client: Socket): any;
    invitePlayer(client: Socket, data: {
        userId: number;
    }): WsResponse<string>;
    joinGame(data: string): string;
    declineInvite(data: {
        userId: number;
    }): void;
    acceptInvite(data: {
        userId: number;
    }, client: Socket): Promise<WsResponse<boolean>>;
    watch(data: {
        userId: number;
    }, client: Socket): Promise<{
        status: boolean;
        reason: string;
        userAId?: number;
        userAUsername?: string;
        userBId?: number;
        userBUsername?: string;
    }>;
    move(cords: {
        x: number;
        y: number;
    }, client: Socket): void;
    gameEnd(data: {
        userId: number;
    }, client: Socket): Promise<void>;
}

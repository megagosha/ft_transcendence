import { Injectable } from '@angular/core';
import * as global from '../globals';
import { BehaviorSubject, EMPTY, map, Observable, tap, throwError } from 'rxjs';
import { UserService } from './user.service';
import { io, Socket } from 'socket.io-client';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
    SnackbarActionsComponent
} from '../snackbar-actions/snackbar-actions.component';
import { Router } from '@angular/router';
import { GameDto, GameStatsDto } from '../game/game.dto';
import { Coordinates, Game } from '../game/elements.entity';
import { User } from './search-users.interface';
import { HttpClient } from '@angular/common/http';
import { LadderDto } from "../game/ladder.dto";

@Injectable({
    providedIn: 'root'
})
export class GameService {
    public apiUrl: string = global.apiUrl;
    public userService: UserService | undefined;
    private socket: Socket | undefined;
    public snackBar: MatSnackBar;
    public oppenentId: number = 0;
    public opponentUsername: string = '';
    public startingPos: { x: number, y: number } = {x: 0, y: 0};
    public watch: {
        status: boolean;
        reason: string;
        userAId: number;
        userAUsername: string;
        userBId: number;
        userBUsername: string;
    } | undefined;
    public game: BehaviorSubject<GameDto> = new BehaviorSubject<GameDto>({ball: {x: 0, y: 0}, players: {}});
    public left = false;

    constructor( private _snackBar: MatSnackBar, private router: Router, private http: HttpClient ) {
        this.snackBar = _snackBar;
    }

    init( us: UserService ) {
        this.userService = us;
        let token = localStorage.getItem('token');
        if (!token)
            token = '';
        console.log(token);
        this.socket = io('http://localhost:3000/game_sock', {transports: ['websocket'], auth: {token: token}});
        console.log(this.socket);
        this.getNewGameEvent();
    }

    getNewGameEvent = () => {
        if (!this.socket)
            return;
        this.socket.on('pending_invite', ( message ) => {
            this._snackBar.openFromComponent(SnackbarActionsComponent, {
                data: message
            });
            console.log(message);
        });
        this.startGame();
    };
// 1. if user leaves game page -> close all intervals. //turn off socket events exept for accept invite
    //2. if user receives game end -> show stat page
    startGame = () => {
        if (!this.socket)
            return;
        this.socket.on('game_ready', ( opponentId: number, oppUsername: string, left: boolean ) => {
            if (!this.userService || !this.socket) return;
            this.socket.off('pending_invite');
            this.gameEnded();
            console.log('from game service: ');
            this.oppenentId = opponentId;
            this.opponentUsername = oppUsername;
            this.left = left;
            console.log(this.oppenentId);
            // this.startingPos.x = game.players[this.userService.user.id].x;
            // this.startingPos.y = game.players[this.userService.user.id].y;
            this.router.navigateByUrl('/game');
        });
    };

    gameEnded = () => {
        if (!this.socket)
            return;
        this.socket.on('game_ended', ( data: { id: number } ) => {
            this.router.navigate(['/results', {id: data.id}]);
            console.log('game ended: ');
            console.log(data.id);
        });
    };

    gameUpdate = () => {
        if (!this.socket)
            return this.game.asObservable();
        this.socket.on('game_update', ( game: GameDto ) => {
            this.game.next(game);
        });
        return this.game.asObservable();
    };


    inviteToPlay( id: number ) {
        if (!this.socket)
            return;
        this.socket.emit('invite_player', {userId: id});
    }

    acceptInvite( userId: number ) {
        if (!this.socket)
            return;
        console.log('accept invite from user ' + userId);
        this.socket.emit('accept_invite', {userId: userId});
    }

    declineInvite( userId: number ) {
        if (!this.socket)
            return;
        this.socket.emit('invite_declined', {userId: userId});
    }

    sendPaddleMove( cords: Coordinates ) {
        if (!this.socket)
            return;
        this.socket.emit('game_move', {x: cords.x, y: cords.y});
    }

    endGame( userId: number ) {
        if (!this.socket)
            return;
        this.socket.off('watch_game');
        this.socket.off('game_move');
        this.socket.off('game_update');
        this.socket.off('game_ended');
        this.socket.emit('game_end', {userId: userId});
        this.watch = undefined;
        this.oppenentId = 0;
        this.getNewGameEvent();
    }

    watchGame( userId: number ) {
        if (!this.socket)
            return;
        this.gameEnded();
        this.socket.emit('watch_game', {userId: userId},
            ( response:
                  {
                      status: boolean,
                      reason: string,
                      userAId: number,
                      userAUsername: string,
                      userBId: number,
                      userBUsername: string
                  } ) => {
                if (response.status) {
                    this.watch = response;
                    this.router.navigate(['/game']);
                }
                console.log(response);
            });
    }

    getGameResult( gameId: number ): Observable<GameStatsDto> {
        console.log('get game resuilts init with id :' + gameId);
        return this.http.get<GameStatsDto>(this.apiUrl + 'game/result', {
            params: {
                id: gameId
            }
        });
    }

    getLadder(): Observable<LadderDto[]> {
      return this.http.get<LadderDto[]>(this.apiUrl + 'game/ladder');
    }

    gameStop() {
        if (!this.socket) return;
        this.socket.emit('game_end', {userId: this.userService?.user.id});
    }

    getPersonalHistory( userId: number, take: number, skip: number ): Observable<GameStatsDto[]> {
        return this.http.get<GameStatsDto[]>(this.apiUrl + 'game/personal_history', {
            params: {
                userId: userId,
                take: take,
                skip: skip
            }
        });
    }
}


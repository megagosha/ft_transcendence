import { Injectable }                                               from "@angular/core";
import { BehaviorSubject, EMPTY, map, Observable, tap, throwError } from "rxjs";
import { UserService }                                              from "./user.service";
import { io, Socket }                                               from "socket.io-client";
import { MatSnackBar }                                              from "@angular/material/snack-bar";
import {
    SnackbarActionsComponent
}                                                                   from "../snackbar-actions/snackbar-actions.component";
import { Router }                                                   from "@angular/router";
import { GameDto, GameState, GameStatsDto, PlayerMatchDto }         from "../game/game.dto";
import { Coordinates, Game }                                        from "../game/elements.entity";
import { User }                                                     from "./search-users.interface";
import { HttpClient }                                               from "@angular/common/http";
import { LadderDto }                                                from "../game/ladder.dto";
import { OpponentDto }                                              from "../game/opponent.dto";
import { Error }                                                    from "./chat.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";


@Injectable({
    providedIn: "root"
})
export class GameService {
    public userService: UserService | undefined;
    private socket: Socket | undefined;
    public snackBar: MatSnackBar;
    public oppenentId: number = 0;
    public watch: boolean = false;
    public startingPos: { x: number, y: number } = {x: 0, y: 0};

    public game: BehaviorSubject<GameDto> = new BehaviorSubject<GameDto>({
        ball: {x: 0, y: 0, color: "orange"},
        players: {}
    });
    public pause: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    public gameState: GameState | undefined;
    // public game: BehaviorSubject<GameDto> = new BehaviorSubject<GameDto>({ball: {x: 0, y: 0, color: "orange"}, players: {}});
    public left = false;

    constructor( private _snackBar: MatSnackBar, private router: Router, private http: HttpClient,
                 private readonly dialog: MatDialog,
    ) {
        this.snackBar = _snackBar;
    }

    init( us: UserService ) {
        this.userService = us;
        let token = localStorage.getItem("token");
        if (!token)
            token = "";
        this.socket = io('/game_sock', {transports: ['websocket'], auth: {token: token}, reconnectionAttempts: 2});
        this.listenError();
        this.getNewGameEvent();
    }

    getNewGameEvent = () => {
        if (!this.socket)
            return;
        this.socket.on("pending_invite", ( message ) => {
            this._snackBar.openFromComponent(SnackbarActionsComponent, {
                data: message
            });
        });
        this.startGame();
    };


    startGame = () => {
        if (!this.socket)
            return;
        this.socket.on("game_ready", ( data: { game: GameState } ) => {
            if (!this.userService || !this.socket) return;
            this.dialog.closeAll();
            this.pause = new BehaviorSubject<number>(data.game.paused);
            this.getPauseEvenets();
            this.getUnPauseEvent();
            this.socket.off("pending_invite");
            if (!data.game.left?.id || !data.game.right?.id)
                return;
            this.gameState = data.game;
            this.gameEnded();
            // this.gameUpdate();
            this.router.navigateByUrl("/game");
        });
    };

    gameEnded = () => {
        if (!this.socket)
            return;
        this.socket.on("game_ended", ( data: { id: number } ) => {
            this.router.navigate(["/results", {id: data.id}]);
        });
    };

    gameUpdate = () => {
        if (!this.socket)
            return this.game.asObservable();
        this.socket.on("game_update", ( game: GameDto ) => {
            this.game.next(game);
        });
        return this.game.asObservable();
    };

    inviteToPlay( id: number ) {
        if (!this.socket)
            return;
        this.socket.emit("invite_player", {userId: id});
    }

    acceptInvite( userId: number ) {
        if (!this.socket)
            return;
        this.socket.emit("accept_invite", {userId: userId});
    }

    declineInvite( userId: number ) {
        if (!this.socket)
            return;
        this.socket.emit("invite_declined", {userId: userId});
    }

    sendPaddleMove( cords: Coordinates ) {
        if (!this.socket)
            return;
        this.socket.emit("game_move", {x: cords.x, y: cords.y});
    }

    endGame( userId: number ) {
        if (!this.socket)
            return;
        this.socket.off("watch_game");
        this.socket.off("game_move");
        this.socket.off("game_update");
        this.socket.off("game_ended");
        this.socket.off("game_paused")
        this.socket.off("game_unpaused")
        this.socket.emit("game_end", {userId: userId});
        this.watch = false;
        this.gameState = undefined;
        this.oppenentId = 0;
        this.getNewGameEvent();
    }

    watchGame( userId: number ) {
        if (!this.socket)
            return;
        this.gameEnded();
        this.socket.emit("watch_game", {userId: userId},
            ( response: GameState ) => {
                this.watch = true;
                this.gameState = response;
                if (response.paused > 0)
                    this.pause.next(response.paused);
                this.getPauseEvenets();
                this.router.navigate(["/game"]);
            });
    }

    getGameResult( gameId: number ): Observable<GameStatsDto> {
        return this.http.get<GameStatsDto>('/api/game/result', {
            params: {
                id: gameId
            }
        });
    }

    getLadder(): Observable<LadderDto[]> {
        return this.http.get<LadderDto[]>("/api/game/ladder");
    }

    gameStop() {
        if (!this.socket) return;
        this.socket.emit("game_end", {userId: this.userService?.user.id});
    }

    matchMaking( paddleColor: string, ballColor: string ) {
        if (!this.socket) return;
        this.socket.emit("random_opponent",
            {
                userId: this.userService?.user.id,
                paddleColor: paddleColor,
                ballColor: ballColor
            });
    }

    getPersonalHistory( userId: number, take: number, skip: number ): Observable<GameStatsDto[]> {
        return this.http.get<GameStatsDto[]>("/api/game/personal_history", {

            params: {
                userId: userId,
                take: take,
                skip: skip
            }
        });
    }


    private listenError(): void {
        this.socket?.on('/error', ( error: Error ) => {
            this.snackBar.open(error.error, "OK", {duration: 3000});
        });
        this.socket?.on("disconnect", () => {
            this.snackBar.open("Cannot connect to server", "OK", {duration: 3000});
        });
        this.socket?.on("connect_error", reason => {
            this.snackBar.open("Cannot connect to server", "OK", {duration: 3000});
        });
    }

    getPauseEvenets() {
        if (!this.socket)
            return;
        this.socket.on("game_paused", ( data: { time: number } ) => {
            if (data.time > 0) {
                this.getUnPauseEvent();
                if (this.socket)
                    this.socket.off("game_update");
                this.pause.next(data.time);
            }
        });
    }

    private getUnPauseEvent() {
        if (!this.socket)
            return;
        this.socket.on("game_unpaused", ( result: boolean ) => {
            if (result) {
                this.pause.next(0);
                this.gameUpdate();
            }
        });
    }

    sendPause() {
        if (!this.socket)
            return;
        this.socket.emit("pause_game", {timeOut: 30});
    }

    sendUnPause() {
        if (!this.socket)
            return;
        this.socket.emit("unpause_game", {userId: this.userService?.user.id});
    }

}

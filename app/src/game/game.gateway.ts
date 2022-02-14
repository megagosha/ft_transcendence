import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
  WsResponse,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger, OnModuleInit, UseFilters } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { User } from "../users/user.entity";
import { SocketExceptionFilter } from "../chat/socket.exception-filter";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GameService } from "./game.service";
import { UserService } from "../users/user.service";

@WebSocketGateway({
  namespace: "/game_sock",
  transports: "websocket",
  cors: {
    origin: ["http://localhost:3000", "http://localhost:4200"],
  },
})
@UseFilters(SocketExceptionFilter)
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly gameService: GameService,
    private userService: UserService
  ) {
    Logger.log("socket constructor init");
  }

  afterInit(server: Server) {
    Logger.log("chat gateway init");
  }

  handleConnection(client: Socket): any {
    try {
      const user: User = this.authService.decodeJwtToken(
        client.handshake.auth.token
      );
      if (!user) {
        client.emit("Unauthorized");
        this.handleDisconnect(client);
      } else {
        this.gameService.newConnection(user.id, client.id);
        client.data.userId = user.id;
        client.data.username = user.username;
      }
    } catch (err) {
      client.emit("Unauthorized");
      this.handleDisconnect(client);
    }
  }

  /*
   1.
   */
  async handleDisconnect(client: Socket): Promise<any> {
    if (!client.data.userId) return client.disconnect();
    await this.gameService.endGame(client.data.userId, this.server);
    this.gameService.removePlayer(client.data.userId);
    client.disconnect();
    return;
  }

  @SubscribeMessage("invite_player")
  invitePlayer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: number }
  ): WsResponse<string> {
    const event = "invite_player_result";
    // if (!opponentRoom) throw new WsException('Player not found');
    const res = this.gameService.invitePlayer(client.data.userId, data.userId);
    if (res.status == false) throw new WsException(res.data);
    this.server.in(res.data).emit("pending_invite", {
      userId: client.data.userId,
      username: client.data.username,
    });
    return { event: event, data: "ok" };
    // if (this.gameService.game.findRoomId(data.userId))
    //   if (this.gameService.game.findGame()) return { event: event, data: data };
  }

  @SubscribeMessage("join_game")
  joinGame(@MessageBody() data: string): string {
    return data;
  }

  @SubscribeMessage("invite_declined")
  declineInvite(@MessageBody() data: { userId: number }) {
    this.gameService.inviteDeclined(data.userId);
    Logger.log("invite from user " + data.userId + " declined");
  }

  @SubscribeMessage("accept_invite")
  async acceptInvite(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket
  ): Promise<WsResponse<boolean>> {
    if (!this.gameService.acceptInvite(data.userId, client.data.userId))
      return { event: "accept_invite", data: false };
    const gameRoom =
      data.userId.toString() + "x" + client.data.userId.toString();
    const opponent_id = this.gameService.game.players.get(
      data.userId
    ).playerSocket;

    client.rooms.clear();
    (await this.server.in(opponent_id).fetchSockets()).pop().rooms.clear();
    client.join(gameRoom);
    this.server.in(opponent_id).socketsJoin(gameRoom);
    // this.server
    //   .in(opponent_id)
    //   .emit('game_ready', { opponentId: client.data.userId });
    // this.server.in(client.id).emit('game_ready', { opponentId: data.userId });
    const game = this.gameService.createNewGame(
      gameRoom,
      data.userId,
      client.data.userId
    );
    const left = game.players[data.userId].x < 10;
    let username: string = (await this.userService.findUser(data.userId))
      .username;
    //
    client.emit("game_ready", data.userId, username, left);
    username = (await this.userService.findUser(client.data.userId)).username;
    this.server
      .in(opponent_id)
      .emit("game_ready", client.data.userId, username, !left);
    let userA, userB: number;
    if (left) {
      userA = data.userId;
      userB = client.data.userId;
    } else {
      userA = client.data.userId;
      userB = data.userId;
    }

    const interval = setInterval(() => {
      // this.gameService.game.findGame(gameRoom).players[data.userId].x += 1;
      this.server
        .to(gameRoom)
        .emit(
          "game_update",
          this.gameService.getGameUpdate(gameRoom, userA, userB)
        );
    }, 16);
    this.gameService.game.registerInterval(gameRoom, interval);
    return { event: "accept_invite", data: true };
  }

  @SubscribeMessage("watch_game")
  async watch(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket
  ): Promise<{
    status: boolean;
    reason: string;
    userAId?: number;
    userAUsername?: string;
    userBId?: number;
    userBUsername?: string;
  }> {
    if (client.data.userId == data.userId) return;
    const gameRoom = this.gameService.game.getPlayer(data.userId);
    Logger.log(gameRoom);
    if (!gameRoom || !gameRoom.gameRoom)
      return {
        status: false,
        reason: "Game not found",
      };
    const res = await this.gameService.getPlayersInfo(gameRoom.gameRoom);
    if (res.status == true) client.join(gameRoom.gameRoom);
    return res;
  }

  @SubscribeMessage("game_move")
  move(
    @MessageBody() cords: { x: number; y: number },
    @ConnectedSocket() client: Socket
  ): void {
    // if (!cords || !cords.x || !cords.y) return;

    const room = this.gameService.game.findRoomId(client.data.userId);
    const game = this.gameService.game.findGame(room);
    // console.log(game.ball.x);
    // console.log(game.players[client.data.userId]);
    if (!game || !game.players[client.data.userId]) return;
    game.players[client.data.userId].y = cords.y > 100 ? 100 : cords.y;
    // console.log('result: ' + game.players[client.data.userId].y);
  }

  @SubscribeMessage("game_end")
  async gameEnd(
    @MessageBody() data: { userId: number },
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    if (data.userId != client.data.userId)
      throw new WsException("Player not found");
    const room = this.gameService.game.findRoomId(client.data.userId);
    try {
      await this.gameService.endGame(data.userId, this.server);
    } catch (e) {
      Logger.log(e);
    }
    // this.server.to(room).emit("game_ended", { id: res });
    // this.server.in(room).socketsLeave(room);
  }
}

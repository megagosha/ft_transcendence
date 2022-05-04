import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User, UserStatus } from "../users/user.entity";
import { Repository } from "typeorm";
import { UserService } from "../users/user.service";
import { Ball, Game, GameStorage, Player } from "./game.dto";
import { GameStatistic } from "./game.history.entity";
import { number } from "joi";
import { SearchUsersResultsDto } from "../users/dto/search-users-results.dto";
import { LadderDto } from "./dto/ladder.dto";
import { Server, Socket } from "socket.io";
import { PlayerMatchDto } from "./dto/player-match.dto";
import { OpponentDto } from "./dto/opponent.dto";
import { GameState } from "./dto/startGame.dto";

@Injectable()
export class GameService {
  game: GameStorage;

  constructor(
      @InjectRepository(User) private readonly userRepo: Repository<User>,
      @InjectRepository(GameStatistic)
      private readonly gameStatRepo: Repository<GameStatistic>,
      private readonly userService: UserService
  ) {
    this.game = new GameStorage();
  }

  invitePlayer(
      inviterId: number,
      invitedId: number
  ): { status: boolean; data: string } {
    const player = this.game.getPlayer(invitedId);
    if (!player) return { status: false, data: "User offline" };
    if (player.gameRoom != "") return { status: false, data: "Player in game" };
    this.game.userAinvitedB(inviterId, invitedId);
    return { status: true, data: player.playerSocket };
  }

  inviteDeclined(inviterId: number) {
    this.game.removeInvite(inviterId);
  }

  acceptInvite(inviterId: number, invitedId: number): boolean {
    const res = this.game.waitingForAccept.get(inviterId);
    if (res != invitedId) return false;
    this.game.waitingForAccept.delete(inviterId);
    return true;
  }

  isPlayerInGame(userId: number): boolean {
    const player = this.game.players.get(userId);
    if (!player || !player.gameRoom) return false;
    const game = this.game.games.get(player.gameRoom);
    if (!game || !game.game.players) return false;
    return true;
  }

  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
  }

  selectRandomColor(bOne: string, bTwo: string) {
    if (bOne == "orange" || bTwo == "orange") {
      if (bOne == "orange") return bTwo;
      return bTwo;
    }
    if (this.getRandomIntInclusive(0, 1)) return bOne;
    return bTwo;
  }

  createNewGame(
      roomId: string,
      pOne: PlayerMatchDto,
      pTwo: PlayerMatchDto
  ): Game {
    const game = new Game(pOne.userId, pTwo.userId);
    game.players = {};
    game.ball = new Ball(50, 50, 2, 2);

    game.ball.color = this.selectRandomColor(pOne.ballColor, pTwo.ballColor);
    game.players[pOne.userId] = new Player(10, 50, 1, 15, pOne.paddleColor);
    game.players[pTwo.userId] = new Player(90, 50, 1, 15, pTwo.paddleColor);
    this.game.setGameRoom(pOne.userId, roomId);
    this.game.setGameRoom(pTwo.userId, roomId);
    this.userService.setStatus(pOne.userId, UserStatus.ACTIVE);
    this.userService.setStatus(pTwo.userId, UserStatus.ACTIVE);
    return game;
  }

  async getGameUpdate(
      gameRoom: string,
      userAId: number,
      userBId: number,
      server: Server
  ) {
    const game = this.game.findGame(gameRoom);
    if (
        game.game.players[userAId].score >= 10 ||
        game.game.players[userBId].score >= 10
    ) {
      this.game.removeInterval(gameRoom);
      await this.endGame(userAId, server);
      return game.game;
    } else {
      game.game.ball.move();
      game.game.checkCollisions(userAId, userBId);
      game.game.gameOver(userAId, userBId);
    }
    return game.game;
    // return this.game.findGame(gameRoom).game;
  }

  async clearRoom(roomOne: string, roomTwo: string, server: Server) {
    (await server.in(roomOne).fetchSockets()).pop().rooms.clear();
    (await server.in(roomTwo).fetchSockets()).pop().rooms.clear();
  }

  async joinRoom(sOne: string, sTwo: string, roomName: string, server: Server) {
    server.in(sOne).socketsJoin(roomName);
    server.in(sTwo).socketsJoin(roomName);
  }

  async startGame(pOne: PlayerMatchDto, pTwo: PlayerMatchDto, server: Server) {
    const gameRoom = pOne.userId.toString() + "x" + pTwo.userId.toString();
    const pOneSock = this.game.players.get(pOne.userId).playerSocket;
    const pTwoSock = this.game.players.get(pTwo.userId).playerSocket;
    this.clearRoom(pOneSock, pTwoSock, server);
    this.joinRoom(pOneSock, pTwoSock, gameRoom, server);

    const gameObj = this.createNewGame(gameRoom, pOne, pTwo);
    const userOne = await this.userService.findUser(pOne.userId);
    const userTwo = await this.userService.findUser(pTwo.userId);
    const gameState = new GameState(gameObj, userOne, userTwo);
    if (!userOne || !userTwo) return;

    server.in(pTwoSock).emit("game_ready", {
      game: gameState,
    });
    server.in(pOneSock).emit("game_ready", {
      game: gameState,
    });

    this.game.games.set(gameRoom, gameState);
    const interval = setInterval(async () => {
      server
          .to(gameRoom)
          .emit(
              "game_update",
              await this.getGameUpdate(gameRoom, userOne.id, userTwo.id, server)
          );
    }, 16); //16
    this.game.registerInterval(gameRoom, interval);
  }

  async endGame(userId: number, server: Server) {
    let res = 0;
    const playerA = this.game.players.get(userId);
    if (!playerA || !playerA.gameRoom || playerA.gameRoom == "") return;
    const playerB = this.game.getOpponentUserId(userId);
    if (playerB == 0) return;
    const roomId = this.game.findRoomId(userId);
    this.userService.setStatus(userId, UserStatus.ONLINE);
    this.userService.setStatus(playerB, UserStatus.ONLINE);
    res = (await this.saveGameStat(playerA.gameRoom, userId, playerB)).id;
    if (roomId) {
      server.to(roomId).emit("game_ended", { id: res });
      server.in(roomId).socketsLeave(roomId);
    }
    this.game.unsetGameRoom(userId);
    this.game.unsetGameRoom(playerB);
    this.game.games.delete(playerA.gameRoom);
    this.game.pause.delete(playerA.gameRoom);
    return res;
  }

  async endGameByRoomId(room: string, server: Server) {
    const game = this.game.games.get(room);
    const pOne = game.left.id;
    this.endGame(pOne, server);
  }

  async saveGameStat(gameRoom: string, userA: number, userB: number) {
    const game = this.game.findGame(gameRoom);
    const res = new GameStatistic();
    let winner: number;
    let loser: number;
    if (game.game.players[userA].score > game.game.players[userB].score) {
      winner = userA;
      loser = userB;
    } else {
      winner = userB;
      loser = userA;
    }
    res.userWon = await this.userService.findUser(winner);
    res.userLost = await this.userService.findUser(loser);
    res.score = [];
    res.score.push(game.game.players[loser].score);
    res.score.push(game.game.players[winner].score);
    const db_res = await this.gameStatRepo.save(res);
    return db_res;
  }

  removePlayer(userId: number) {
    this.game.players.delete(userId);
    this.game.waitingForAccept.delete(userId);
    this.userService.setStatus(userId, UserStatus.OFFLINE);
  }

  newConnection(userId: number, socketId: string) {
    this.userService.setStatus(userId, UserStatus.ONLINE);
    this.game.addPlayer(userId, socketId);
  }

  async getGameResult(id: number): Promise<GameStatistic> {
    return await this.gameStatRepo.findOne(
        { id: id },
        { relations: ["userWon", "userLost"] }
    );
  }

  async getOneOnOneHistory(
      userA: number,
      userB: number,
      take: number,
      skip: number
  ): Promise<GameStatistic[]> {
    return await this.gameStatRepo.find({
      where: [
        {
          userLost: userA,
          userWon: userB,
        },
        { userWon: userA, userLost: userB },
      ],
      relations: ["userWon", "userLost"],
      take: take,
      skip: skip,
    });
  }

  async getPersonalHistory(
      userA: number,
      take: number,
      skip: number
  ): Promise<GameStatistic[]> {
    return await this.gameStatRepo.find({
      where: [
        {
          userWonId: userA,
        },
        {
          userLostId: userA,
        },
      ],
      relations: ["userWon", "userLost"],
      // take: take,
      // skip: skip,
    });
  }

  async getLadder(): Promise<LadderDto[]> {
    const res = (
        await this.gameStatRepo
            .createQueryBuilder("game")
            .leftJoinAndSelect("game.userWon", "user")
            .select("user.username")
            .addSelect("user.avatarImgName")
            // .select('user.username')
            .addSelect("game.userWonId AS userWonId")
            .addSelect("COUNT(*) AS count")
            .groupBy("game.userWonId")
            .addGroupBy("user.username")
            .addGroupBy("user.avatarImgName")
            .orderBy("count", "DESC")
            .getRawMany()
    ).map((obj, ix) => new LadderDto(obj, ix));
    return res;
  }

  addUserToMatchMaking(data: PlayerMatchDto): {
    ready: boolean;
    data?: PlayerMatchDto;
  } {
    if (this.game.matchMaking.get(data.userId) != null)
      return { ready: false, data: undefined };
    if (this.game.matchMaking.size > 0) {
      const key = this.game.matchMaking.keys();
      const opponentId = key.next().value;
      const game = this.game.matchMaking.get(opponentId);
      this.game.matchMaking.delete(opponentId);
      this.game.matchMaking.delete(data.userId);
      return { ready: true, data: game };
    } else {
      this.game.addPlayerToMatchMaking(data);
      return {
        ready: false,
        data: undefined,
      };
    }
  }

  pauseGame(room: string, timeOut: number, server: Server) {
    clearInterval(this.game.intervals.get(room));
    this.game.removeInterval(room);
    server.in(room).emit("game_paused", {
      time: timeOut,
    });
    const timeout = setTimeout(async () => {
      await this.endGameByRoomId(room, server);
    }, timeOut * 1000); //16
    this.game.setGamePaused(room, timeout);
    return true;
  }

  unPauseGame(room: string, userId: number, server: Server) {
    const res = this.game.unPausePlayer(room, userId);
    if (res.result) {
      const game = this.game.findGame(room);
      if (!game) return;
      game.paused = 0;
      clearTimeout(res.timeOut);
      this.game.pause.delete(room);
      server.to(room).emit("game_unpaused", true);
      const interval = setInterval(async () => {
        server
            .to(room)
            .emit(
                "game_update",
                (await this.getGameUpdate(room, game.left.id, game.right.id, server))
            );
      }, 16); //16
      this.game.registerInterval(room, interval);
    }
  }

  connectToPause(
      userId: number,
      room: string,
      socketId: string,
      server: Server
  ) {
    const player = this.game.players.get(userId);
    player.gameRoom = room;
    player.playerSocket = socketId;
    server.in(socketId).socketsJoin(room);
    const game = this.game.games.get(room);
    const timeOut = this.game.pause.get(room);
    game.paused =
        30 - (new Date().getTime() - timeOut.timeSet.getTime()) / 1000;
    server.in(socketId).emit("game_ready", {
      game: this.game.games.get(room),
    });
  }
}

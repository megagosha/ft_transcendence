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

  createNewGame(roomId: string, userAId: number, userBId: number): Game {
    const game = new Game(userAId, userBId);
    game.players = {};
    game.ball = new Ball(50, 50, 2, 2);
    game.players[userAId] = new Player(10, 50, 1, 15);
    game.players[userBId] = new Player(90, 50, 1, 15);
    this.game.saveGame(roomId, game);
    this.game.setGameRoom(userAId, roomId);
    this.game.setGameRoom(userBId, roomId);
    this.userService.setStatus(userAId, UserStatus.ACTIVE);
    this.userService.setStatus(userBId, UserStatus.ACTIVE);
    return game;
  }

  getGameUpdate(gameRoom: string, userAId: number, userBId: number) {
    const game = this.game.findGame(gameRoom);
    game.ball.move();
    game.checkCollisions(userAId, userBId);
    game.gameOver(userAId, userBId);
    return this.game.findGame(gameRoom);
  }

  async getPlayersInfo(gameRoom: string) {
    const game = this.game.findGame(gameRoom);
    Logger.log("service ");
    Logger.log(game);
    console.log(game.players);
    if (!game || !game.players)
      return {
        status: false,
        reason: "Game not found",
      };
    const data = {
      status: false,
      reason: "internal error",
      userAId: 0,
      userAUsername: "",
      userBId: 0,
      userBUsername: "",
    };
    const players = Object.keys(game.players);
    if (game.players[players[0]].x > 10) {
      const tmp = players[1];
      players[1] = players[0];
      players[0] = tmp;
    }
    data.userAId = Number(players[0]);
    data.userAUsername = (
      await this.userService.findUser(data.userAId)
    ).username;
    data.userBId = Number(players[1]);
    data.userBUsername = (
      await this.userService.findUser(data.userBId)
    ).username;
    if (data.userAUsername && data.userBUsername) {
      data.status = true;
      data.reason = "ok";
    }
    return data;
  }

  async endGame(userId: number, server: Server) {
    let res = 0;
    const playerA = this.game.players.get(userId);
    if (!playerA || !playerA.gameRoom || playerA.gameRoom == "") return;
    const playerB = this.game.getOpponentUserId(userId);
    if (playerB != 0)
      res = (await this.saveGameStat(playerA.gameRoom, userId, playerB)).id;
    const roomId = this.game.findRoomId(userId);
    if (roomId) {
      server.to(roomId).emit("game_ended", { id: res });
      server.in(roomId).socketsLeave(roomId);
    }
    this.game.removeInterval(playerA.gameRoom);
    this.game.unsetGameRoom(userId);
    this.game.unsetGameRoom(playerB);
    this.userService.setStatus(userId, UserStatus.ONLINE);
    this.userService.setStatus(playerB, UserStatus.ONLINE);
    this.game.games.delete(playerA.gameRoom);
    return res;
  }

  async saveGameStat(gameRoom: string, userA: number, userB: number) {
    const game = this.game.findGame(gameRoom);
    const res = new GameStatistic();
    let winner: number;
    let loser: number;
    if (game.players[userA].score > game.players[userB].score) {
      winner = userA;
      loser = userB;
    } else {
      winner = userB;
      loser = userA;
    }
    res.userWon = await this.userService.findUser(winner);
    res.userLost = await this.userService.findUser(loser);
    res.score = [];
    res.score.push(game.players[loser].score);
    res.score.push(game.players[winner].score);
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
        // .skip(skip)
        // .take(take)
        .getRawMany()
    ).map((obj, ix) => new LadderDto(obj, ix));
    console.log(res);
    return res;
  }
}

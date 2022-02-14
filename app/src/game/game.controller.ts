import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GameService } from "./game.service";
import { User } from "../users/user.entity";
import { GameStatsDto } from "./gamestats.dto";
import { SearchUsersDto } from "../users/dto/search-users.dto";
import { GameStatistic } from "./game.history.entity";

@ApiTags("game")
@Controller("game")
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get("result")
  @UseGuards(JwtAuthGuard)
  async gameResult(@Query() data: { id: number }): Promise<GameStatsDto> {
    if (!data.id) throw new NotFoundException();
    const res = await this.gameService.getGameResult(data.id);
    if (!res) throw new NotFoundException();
    return new GameStatsDto(res);
  }

  // @Get("one_on_one_history")
  // @UseGuards(JwtAuthGuard)
  // async getOneOnOne(
  //   @Query() data: { userA: number; userB: number; take: number; skip: number }
  // ): Promise<GameStatsDto[]> {
  //   if (!data.userA || !data.userB || !data.take || !data.skip)
  //     throw new NotFoundException();
  //   const res = await this.gameService.getOneOnOneHistory(
  //     data.userA,
  //     data.userB,
  //     data.take,
  //     data.skip
  //   );
  //   if (!res) return null;
  //   return res;
  // }

  @Get("personal_history")
  @UseGuards(JwtAuthGuard)
  async getPersonal(
    @Query() data: { userId: number; take: number; skip: number }
  ): Promise<GameStatsDto[]> {
    if (!data.userId || !data.take || !data.skip) throw new NotFoundException();
    return await this.gameService.getPersonalHistory(
      data.userId,
      data.take,
      data.skip
    );
  }

  @Get("ladder")
  @UseGuards(JwtAuthGuard)
  async getGameLadder(): Promise<any> {
    return await this.gameService.getLadder();
  }

  // @ApiOperation({ description: 'Создать игру' })
  // @ApiBody({ description: 'Данные игры', type: ChatCreateInDto })
  // @ApiResponse({
  //   description: 'Id чата',
  //   status: HttpStatus.CREATED,
  //   type: ChatCreateOutDto,
  // })
  // @SubscribeMessage('create_game')
  // async createGame(@MessageBody() data: string): Promise<any> {
  //   return await this.gameService.createNewGame();
  // }
}

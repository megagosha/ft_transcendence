import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GameService } from "./game.service";
import { GameStatsDto } from "./gamestats.dto";
import { GetHistoryDto } from "./dto/get-history.dto";
import { LadderDto } from "./dto/ladder.dto";
@ApiTags("game")
@Controller("/api/game")
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({ description: "Получить результат матча" })
  @ApiQuery({
    name: "id",
    description: "id игры",
    example: 10,
    required: true,
  })
  @ApiOkResponse({
    description: "История матчей",
    isArray: false,
    type: GameStatsDto,
  })
  @Get("result")
  @UseGuards(JwtAuthGuard)
  async gameResult(@Query() data: { id: number }): Promise<GameStatsDto> {
    if (!data.id) throw new NotFoundException();
    const res = await this.gameService.getGameResult(data.id);
    if (!res) throw new NotFoundException();
    return new GameStatsDto(res);
  }

  @ApiOperation({ description: "Получить индивидуальную историю игрока" })
  @ApiQuery({
    name: "параметры",
    type: GetHistoryDto,
    required: true,
  })
  @ApiOkResponse({
    description: "История матчей",
    isArray: true,
    type: GameStatsDto,
  })
  @Get("personal_history")
  @UseGuards(JwtAuthGuard)
  async getPersonal(@Query() data: GetHistoryDto): Promise<GameStatsDto[]> {
    if (!data.userId || !data.take || !data.skip) throw new NotFoundException();
    return (
      await this.gameService.getPersonalHistory(
        data.userId,
        data.take,
        data.skip
      )
    ).map((stat) => new GameStatsDto(stat));
  }

  @ApiOperation({ description: "Получить турнирную таблицу" })
  @ApiOkResponse({
    description: "Список игроков в турнирной таблице",
    isArray: true,
    type: LadderDto,
  })
  @Get("ladder")
  @UseGuards(JwtAuthGuard)
  async getGameLadder(): Promise<any> {
    return await this.gameService.getLadder();
  }
}

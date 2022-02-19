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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GameService } from './game.service';
import { GameStatsDto } from './gamestats.dto';
import {UsersServiceSupport} from "../users/users.service-support";

@ApiTags('game')
@Controller('/api/game')
@UseGuards(JwtAuthGuard)
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('result')
  @UseGuards(JwtAuthGuard)
  async gameResult(@Query() data: { id: number }): Promise<GameStatsDto> {
    console.log(data.id);
    if (!data.id) throw new NotFoundException();
    const res = await this.gameService.getGameResult(data.id);
    if (!res) throw new NotFoundException();
    res.userWon.avatarImgName = UsersServiceSupport.getUserAvatarPath(res.userWon);
    res.userLost.avatarImgName = UsersServiceSupport.getUserAvatarPath(res.userLost);
    console.log('results: ');
    console.log(res);
    return new GameStatsDto(res);
  }

  @Get('one_on_one_history')
  @UseGuards(JwtAuthGuard)
  async getOneOnOne(
    @Query() data: { userA: number; userB: number; take: number; skip: number },
  ): Promise<GameStatsDto[]> {
    if (!data.userA || !data.userB || !data.take || !data.skip)
      throw new NotFoundException();
    const res = await this.gameService.getOneOnOneHistory(
      data.userA,
      data.userB,
      data.take,
      data.skip,
    );
    if (!res) return null;
    res.forEach(game => {
      game.userWon.avatarImgName = UsersServiceSupport.getUserAvatarPath(game.userWon);
      game.userLost.avatarImgName = UsersServiceSupport.getUserAvatarPath(game.userLost);
    })
    return res;
  }

  @Get('personal_history')
  @UseGuards(JwtAuthGuard)
  async getPersonal(
    @Query() data: { userId: number; take: number; skip: number },
  ): Promise<GameStatsDto[]> {
    if (!data.userId || !data.take || !data.skip) throw new NotFoundException();
    const res = await this.gameService.getPersonalHistory(
      data.userId,
      data.take,
      data.skip,
    );
    if (!res) return null;
    res.forEach(game => {
      game.userWon.avatarImgName = UsersServiceSupport.getUserAvatarPath(game.userWon);
      game.userLost.avatarImgName = UsersServiceSupport.getUserAvatarPath(game.userLost);
    });
    return res;
  }

  @Get('ladder')
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

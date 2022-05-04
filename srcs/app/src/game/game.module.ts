import { User } from '../users/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { UserModule } from '../users/user.module';
import { AuthModule } from '../auth/auth.module';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { GameStatistic } from './game.history.entity';
import { UserStatistics } from './gamestats.entity';
// import { GameStatistic } from './gamestats.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, GameStatistic, UserStatistics]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  providers: [GameGateway, GameService],
  controllers: [GameController],
  exports: [GameService],
})
export class GameModule {}

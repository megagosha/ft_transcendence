import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Friendship } from './users/friendlist.entity';
import { GameStatistic } from './game/gamestats.entity';

@Module({
  controllers: [CatsController, AppController],
  providers: [CatsService, AppService],
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forRoot({
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
      entities: [User, Friendship, GameStatistic],
    }),
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { Friendship } from './users/friendlist.entity';
import { GameStatistic } from './game/gamestats.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { rootPath, renderPath } from './constants';
@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AuthModule,
    UserModule,
    ServeStaticModule.forRoot({
      rootPath: rootPath,
    }),
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

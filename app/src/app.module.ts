import { GameModule } from './game/game.module';
import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./users/user.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import "reflect-metadata";
import "es6-shim";
import { ChatModule } from "./chat/chat.module";
import { FileModule } from "./file/file.module";

@Module({
  controllers: [AppController],
  providers: [AppService],
  imports: [
    AuthModule,
    UserModule,
    GameModule,
    ChatModule,
    FileModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), "..", "front", "src"),
    }),
    TypeOrmModule.forRoot({
      host: process.env.DB_HOST,
      port: Number.parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE_NAME,
    }),
  ],
})
export class AppModule {}

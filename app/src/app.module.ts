import { Module } from '@nestjs/common';
import { CatsController } from './cats/cats.controller';
import { CatsService } from './cats/cats.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';

@Module({
  controllers: [CatsController, AppController],
  providers: [CatsService, AppService],
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({ entities: [User] }),
  ],
})
export class AppModule {}

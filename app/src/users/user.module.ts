import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Friendship } from './friendlist.entity';
import { UserController } from './user.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersServiceSupport } from './users.service-support';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Friendship]),
    forwardRef(() => AuthModule),
  ],
  providers: [UserService, UsersServiceSupport],
  controllers: [UserController],
  exports: [UserService, UsersServiceSupport],
})
export class UserModule {}

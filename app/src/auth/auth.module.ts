import { HttpModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './42.strategy';

@Module({
  imports: [UsersModule, HttpModule],
  providers: [AuthService, FortyTwoStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '../users/user.module';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './42.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { SocketStrategy } from './socket.strategy';
import { GoogleStrategy } from './google.strategy';
import { TmpStrategy } from './tmp.strategy';

@Module({
  imports: [
    forwardRef(() => UserModule),
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '10000s' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    AuthService,
    FortyTwoStrategy,
    GoogleStrategy,
    TmpStrategy,
    JwtStrategy,
    SocketStrategy,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}

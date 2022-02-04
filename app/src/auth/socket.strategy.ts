import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ExtractJwt } from 'passport-jwt';
import { jwtConstants } from '../constants';

//@todo remove file
@Injectable()
export class SocketStrategy extends PassportStrategy(Strategy, 'socket') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
    Logger.log('socket jwt init');
  }

  async validate(payload: any): Promise<any> {
    const user = { id: payload.id, ftId: payload.ftId, login: payload.login };
    Logger.log('validate in socket strategy triggered');
    return user;
  }
}

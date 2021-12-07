import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class JwcStrategy extends PassportStrategy(Strategy, 'jwc') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(id: number, username: string): Promise<any> {
    const user = await this.authService.validateUser(id, username);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}

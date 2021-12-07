import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(id: number, username: string): Promise<any> {
    const user = await this.usersService.findOneByAppId(id, username);
    if (user && user.id === id) {
      return user;
    }
    return null;
  }

  //@todo if user not found create new user.
  async findUserFrom42Id(fortyTwoId: number, email: string): Promise<any> {
    const user = await this.usersService.findOneByFortyTwoId(fortyTwoId);
    Logger.log('User logged with id ' + fortyTwoId + ' email ' + email);
    if (!user) {
      Logger.log('User id: ' + fortyTwoId + ' is not authorized');
      return null;
    }
    const payload = { userId: user.id, sub: user.username };
    return {
      access_token: this.jwtService.sign(payload),
    };
    // return user;
  }
}

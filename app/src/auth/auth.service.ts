import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async findUserFrom42Id(userId: number): Promise<any> {
    const user = await this.usersService.find42User('userId', userId);

    if (!user) {
      Logger.log('User id: ' + userId + ' is not authorized');
      throw new UnauthorizedException();
    }
    return user;
  }
}

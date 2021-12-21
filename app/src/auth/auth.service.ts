import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { stringify } from 'ts-jest/dist/utils/json';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { FindUserDto } from '../users/dto/find-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async jwtLogin(id: number, username: string) {
    const payload = { id: id, username: username };
    Logger.log(
      'Issuing jwt token with payload: ' + id + ' username:  ' + username,
    );
    const res = this.jwtService.sign(payload);
    Logger.debug(`Generated JWT token with payload ` + res);
    return res;
  }

  //@todo if user not found create new user.
  // async findUserFrom42Id(fortyTwoId: number, email: string): Promise<any> {
  //   const user = await this.usersService.findOneByFortyTwoId(fortyTwoId);
  //   Logger.log('User logged with id ' + fortyTwoId + ' email ' + email);
  //   if (!user) {
  //     Logger.log('User id: ' + fortyTwoId + ' is not authorized');
  //     return null;
  //   }
  //   return user;
  // const payload = { userId: user.id, sub: user.username };
  // return {
  //   access_token: this.jwtService.sign(payload),
  // };
  // return user;
  // }
}

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
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
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async jwtLogin(id: number, ftId: number, login: string) {
    const payload = { id: id, ftId: ftId, login: login };
    Logger.log(
      'Issuing jwt token with payload: ' +
        id +
        ' ftid ' +
        ftId +
        ' login ' +
        login,
    );
    const res = this.jwtService.sign(payload);
    Logger.debug(`Generated JWT token with payload ` + res);
    return {
      access_token: res,
    };
  }

  async findUser(ftId: number, email: string): Promise<any> {
    const user = await this.userRepo.findOne({
      fortytwo_id: ftId,
      email: email,
    });
    if (!user) {
      Logger.log('User with id ' + ftId + ' email ' + email + ' not found');
      return null;
    }
    return user;
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

import { Injectable, Logger } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { stringify } from 'ts-jest/dist/utils/json';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { FindUserDto } from '../users/dto/find-user.dto';
import { jwtConstants } from '../constants';
import { authenticator } from 'otplib';
import { toFileStream } from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  jwtLogin(id: number, username: string) {
    const payload = { id: id, username: username, twoAuth: true };
    Logger.log(
      'Issuing jwt token with payload: ' + id + ' username:  ' + username,
    );
    const res = this.jwtService.sign(payload, { secret: jwtConstants.secret });
    Logger.debug(`Generated JWT token with payload ` + res);
    return res;
  }

  decodeJwtToken(token: string): User {
    return this.jwtService.verify(token, { secret: jwtConstants.secret });
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

  async tmpLogin(id: number, username: string) {
    const payload = { id: id, username: username, twoAuth: false };
    Logger.log(
      'Issuing tmp login token with payload: ' + id + ' username:  ' + username,
    );
    const res = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
    });
    Logger.debug(`Generated tmp token with payload ` + res);
    return res;
  }

  public async generateTwoAuthSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
      user.id.toString(),
      jwtConstants.twoAuthAppName,
      secret,
    );
    await this.usersService.setTwoFactor(secret, user.id);
    return {
      secret,
      otpauthUrl,
    };
  }

  isTwoAuthValid(twoAuthCode: string, user: User) {
    console.log(twoAuthCode);
    return authenticator.verify({ token: twoAuthCode, secret: user.twoAuth });
  }

  pipeQrCodeStream(response: Response, otpUrl: string) {
    return toFileStream(response, otpUrl);
  }
}

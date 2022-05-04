import { Injectable, Logger } from "@nestjs/common";
import { UserService } from "../users/user.service";
import { JwtService } from "@nestjs/jwt";
import { stringify } from "ts-jest/dist/utils/json";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { FindUserDto } from "../users/dto/find-user.dto";
import { jwtConstants } from "../constants";
import { authenticator } from "otplib";
import { toFileStream } from "qrcode";

@Injectable()
export class AuthService {
  constructor(
      @InjectRepository(User) private userRepo: Repository<User>,
      private usersService: UserService,
      private jwtService: JwtService
  ) {}

  jwtLogin(id: number, username: string) {
    const payload = { id: id, username: username, twoAuth: true };
    const res = this.jwtService.sign(payload, { secret: jwtConstants.secret });
    return res;
  }

  decodeJwtToken(token: string): User {
    return this.jwtService.verify(token, { secret: jwtConstants.secret });
  }

  async tmpLogin(id: number, username: string) {
    const payload = { id: id, username: username, twoAuth: false };
    const res = this.jwtService.sign(payload, {
      secret: jwtConstants.secret,
    });
    return res;
  }

  public async generateTwoAuthSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpauthUrl = authenticator.keyuri(
        user.id.toString(),
        jwtConstants.twoAuthAppName,
        secret
    );
    await this.usersService.setTwoFactor(secret, user.id);
    return {
      secret,
      otpauthUrl,
    };
  }

  isTwoAuthValid(twoAuthCode: string, user: User) {
    return authenticator.verify({ token: twoAuthCode, secret: user.twoAuth });
  }

  pipeQrCodeStream(response: Response, otpUrl: string) {
    return toFileStream(response, otpUrl);
  }
}

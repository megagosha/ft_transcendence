import { Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { ExtractJwt } from "passport-jwt";
import { jwtConstants } from "../constants";
import { UserService } from "../users/user.service";

@Injectable()
export class TmpStrategy extends PassportStrategy(Strategy, "tmp") {
  constructor(private _userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any): Promise<any> {
    const user = { id: payload.id, ftId: payload.ftId, login: payload.login };
    const res = await this._userService.findUser(payload.id);
    if (!res) throw new UnauthorizedException();
    return user;
  }
}

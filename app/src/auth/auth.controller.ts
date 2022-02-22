import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { stringify } from "ts-jest/dist/utils/json";
import { UserService } from "../users/user.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { TmpAuthGuard } from "./tmp-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @Get("ft")
  @UseGuards(AuthGuard("fortytwo"))
  async ftAuth(@Req() req) {
    return;
  }

  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() req) {
    return;
  }

  @Get("ft/redirect")
  @UseGuards(AuthGuard("fortytwo"))
  async getUserFromFtLogin(@Req() req, @Res() res): Promise<any> {
    Logger.log(stringify(req.user));
    let user = await this.userService.findFtUser(req.user.id, req.user.email);
    if (user == null) {
      Logger.log("User not found in database! Creating new user...");
      const newUser = new CreateUserDto();
      newUser.email = req.user.email;
      newUser.username = req.user.username;
      newUser.fortytwo_id = req.user.id;
      if (!req.user.image_url)
        newUser.avatarImgName = "https://cdn.intra.42.fr/users/default.png";
      else newUser.avatarImgName = req.user.image_url;
      user = await this.userService.createNewUser(newUser);
    } else if (user.twoAuth != null) {
      const jwt = await this.authService.tmpLogin(user.id, user.username);
      return res.redirect("http://localhost:4200/login/otp/?token=" + jwt);
    }
    const jwt = await this.authService.jwtLogin(user.id, user.username);
    return res.redirect("http://localhost:4200/login/success/?token=" + jwt);
  }

  @Get("google/redirect")
  @UseGuards(AuthGuard("google"))
  async getUserFromGoogleLogin(@Req() req, @Res() res): Promise<any> {
    let user = await this.userService.findWithEmail(req.user.email);
    if (user == null) {
      const newUser = new CreateUserDto();
      newUser.email = req.user.email;
      newUser.username = req.user.username;
      newUser.google_id = req.user.id;
      if (!req.user.image_url) newUser.avatarImgName = req.user.image_url;
      else newUser.avatarImgName = req.user.image_url;
      user = await this.userService.createNewUser(newUser);
    } else if (user.twoAuth != null) {
      console.log("here");
      const jwt = await this.authService.tmpLogin(user.id, user.username);
      return res.redirect("http://localhost:4200/login/otp/?token=" + jwt);
    }
    const jwt = await this.authService.jwtLogin(user.id, user.username);
    return res.redirect("http://localhost:4200/login/success/?token=" + jwt);
  }

  @Post("2auth/login")
  @UseGuards(TmpAuthGuard)
  async twoAuthLogin(@Req() req, @Body() code: { code: string }): Promise<any> {
    const user = await this.userService.findUser(req.user.id);
    const isCodeValid = this.authService.isTwoAuthValid(code.code, user);
    console.log(isCodeValid);
    if (!isCodeValid) throw new UnauthorizedException("Wrong code");
    return { token: this.authService.jwtLogin(req.user.id, req.user.username) };
  }

  @Post("2auth/generate")
  @UseGuards(JwtAuthGuard)
  async generate(
    @Res() response,
    @Req() req,
    @Body() data: { userId: number }
  ): Promise<any> {
    console.log(req.user);
    const user = await this.userService.findUser(req.user.id);
    console.log(user);
    const result = await this.authService.generateTwoAuthSecret(user);
    return this.authService.pipeQrCodeStream(response, result.otpauthUrl);
  }

  @Get("2auth/disable")
  @UseGuards(JwtAuthGuard)
  async disable(@Req() req): Promise<any> {
    return await this.userService.removeTwoFactor(req.user.id);
  }
}

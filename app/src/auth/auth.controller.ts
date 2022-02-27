import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { UserService } from "../users/user.service";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { TmpAuthGuard } from "./tmp-auth.guard";
import { ApiBody, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { TwoAuthCodeDto } from "./dto/twoAuth.dto";
import { TokenDto } from "./dto/token.dto";
import { CurrentUserId } from "../util/user.decarator";
import { UserIdDto } from "./dto/userId.dto";
import { UpdateResult } from "typeorm/query-builder/result/UpdateResult";

@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @ApiOperation({ description: "Начало для авторизации в 42" })
  @Get("ft")
  @UseGuards(AuthGuard("fortytwo"))
  async ftAuth(@Req() req) {
    return;
  }

  @ApiOperation({ description: "Начало для авторизации в гугл" })
  @Get("google")
  @UseGuards(AuthGuard("google"))
  async googleAuth(@Req() req) {
    return;
  }

  @ApiOperation({
    description:
      "После авторизация в 42 пользователь приходит на этот эндпоинт",
  })
  @Get("ft/redirect")
  @UseGuards(AuthGuard("fortytwo"))
  async getUserFromFtLogin(@Req() req, @Res() res): Promise<any> {
    let user = await this.userService.findFtUser(req.user.id, req.user.email);
    if (user == null) {
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

  @ApiOperation({
    description:
      "После авторизация в гугл пользователь приходит на этот эндпоинт",
  })
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
      const jwt = await this.authService.tmpLogin(user.id, user.username);
      return res.redirect("http://localhost:4200/login/otp/?token=" + jwt);
    }
    const jwt = await this.authService.jwtLogin(user.id, user.username);
    return res.redirect("http://localhost:4200/login/success/?token=" + jwt);
  }

  @ApiOperation({ description: "Triggered if 2auth enabled" })
  @ApiBody({
    description: "Код двухфакторной авторизации",
    type: TwoAuthCodeDto,
  })
  @ApiOkResponse({ description: "Токен для авторизации", type: TokenDto })
  @Post("2auth/login")
  @UseGuards(TmpAuthGuard)
  async twoAuthLogin(
    @Req() req,
    @Body() code: TwoAuthCodeDto
  ): Promise<TokenDto> {
    const user = await this.userService.findUser(req.user.id);
    const isCodeValid = this.authService.isTwoAuthValid(code.code, user);
    if (!isCodeValid) throw new UnauthorizedException("Wrong code");
    return { token: this.authService.jwtLogin(req.user.id, req.user.username) };
  }

  @ApiOperation({
    description: "Генерирует QR код для двухфакторной авторизации",
  })
  @ApiBody({ description: "Id usera", type: UserIdDto })
  @Post("2auth/generate")
  @UseGuards(JwtAuthGuard)
  async generate(
    @Res() response,
    @CurrentUserId() userId: number,
    @Body() data: UserIdDto
  ): Promise<any> {
    const user = await this.userService.findUser(userId);
    const result = await this.authService.generateTwoAuthSecret(user);
    return this.authService.pipeQrCodeStream(response, result.otpauthUrl);
  }

  @ApiOperation({
    description: "Выключает двухфакторную афторизацию",
  })
  @Get("2auth/disable")
  @UseGuards(JwtAuthGuard)
  async disable(@Req() req): Promise<UpdateResult> {
    return await this.userService.removeTwoFactor(req.user.id);
  }
}

import {
  Controller,
  Get,
  Logger,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { stringify } from 'ts-jest/dist/utils/json';
import { UserService } from '../users/user.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';

//Authentication scheme
//1. Get api token from 42
//2. Get user id and user name from intra
//3. Check in db by intra user_id
//4. If user id not found, reutrn error
//5. If user id found, issue jwt and put it to user table

@Controller('auth/ft')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}
  @Get()
  @UseGuards(AuthGuard('fortytwo'))
  async ftAuth(@Req() req) {
    return;
  }

  @Get('redirect')
  @UseGuards(AuthGuard('fortytwo'))
  async getUserFromFtLogin(@Req() req, @Res() res): Promise<any> {
    Logger.log(stringify(req.user));
    let user = await this.userService.findFtUser(req.user.id, req.user.email);
    if (user == null) {
      Logger.log('User not found in database! Creating new user...');
      const newUser = new CreateUserDto();
      newUser.email = req.user.email;
      newUser.username = req.user.username;
      newUser.fortytwo_id = req.user.id;
      newUser.avatarImgName = req.user.image_url;
      user = await this.userService.createNewUser(newUser);
    }
    const jwt = await this.authService.jwtLogin(user.id, user.username);
    return res.redirect('http://localhost:4200/login/success/?token=' + jwt);
  }
}

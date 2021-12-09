import {
  Controller,
  Get,
  Logger,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { stringify } from 'ts-jest/dist/utils/json';
import { UsersService } from '../users/users.service';
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
    private userService: UsersService,
  ) {}
  @Get()
  @UseGuards(AuthGuard('fortytwo'))
  async ftAuth(@Req() req) {
    return;
  }

  @Get('redirect')
  @UseGuards(AuthGuard('fortytwo'))
  async getUserFromFtLogin(@Req() req): Promise<any> {
    // const payload = {
    //   id: req.user.id,
    //   email: req.user.email,
    //   login: req.user.login,
    //   displayname: req.user.displayname,
    //   image_url: req.user.image_url,
    // };
    const res = await this.authService.findUser(req.user.id, req.user.email);
    if (res == null) {
      Logger.log('User not found in database! Create new user');
      const newUser = new CreateUserDto();
      newUser.email = req.user.email;
      newUser.username = req.user.username;
      newUser.fortytwo_id = req.user.id;
      newUser.avatarImgName = req.user.image_url;
      await this.userService.createNewUser(newUser);
    }
    Logger.log('sdfsdf');
    Logger.log(stringify(res));
    return this.authService.jwtLogin(
      req.user.id,
      req.user.email,
      req.user.username,
    );
  }
}

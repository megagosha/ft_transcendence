import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

//Authentication scheme
//1. Get api token from 42
//2. Get user id and user name from intra
//3. Check in db by intra user_id
//4. If user id not found, reutrn error
//5. If user id found, issue jwt and put it to user table

@Controller('auth')
export class AuthController {
  @Get('login')
  @UseGuards(AuthGuard('fortytwo'))
  async getUserFromDiscordLogin(@Req() req): Promise<any> {
    return req.user;
  }
}

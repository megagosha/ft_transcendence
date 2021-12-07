import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  @Get('login')
  @UseGuards(AuthGuard('fortytwo'))
  async getUserFromDiscordLogin(@Req() req): Promise<any> {
    return req.user;
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwc'))
  async profile(@Req() req): Promise<any> {
    return 'Yo';
  }
}

import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}
  @Get('login')
  @UseGuards(AuthGuard('fortytwo'))
  async getUserFromDiscordLogin(@Req() req): Promise<any> {
    return req.user;
  }

  @Post('set_username')
  @UseGuards(JwtAuthGuard)
  async setUsername(
    @Body() changeUserName: ChangeUsernameDto,
    @Req() req,
  ): Promise<string> {
    await this.userService.setUsername(changeUserName, req.user.id);
    return;
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req): Promise<any> {
    return await this.userService.findUser(req.user.id);
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async searchUser(@Query() params: SearchUsersDto): Promise<User[]> {
    return await this.userService.searchUsersByUsername(params);
  }
}

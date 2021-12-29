import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Logger,
  Param,
  Post,
  Query,
  Req,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { extname } from 'path';

import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './user.service';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { User } from './user.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { UserProfileDto } from './dto/user-profile.dto';
import { rootPath } from '../constants';
import { SearchUsersResultsDto } from './dto/search-users-results.dto';
import { Friendship } from './friendlist.entity';
import { AddFriendDto } from './dto/add-friend.dto';
// import { fileTypeFromFile } from 'file-type';

@Controller('user')
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('set_username')
  @UseGuards(JwtAuthGuard)
  async setUsername(
    @Body() changeUserName: ChangeUsernameDto,
    @Req() req,
  ): Promise<string> {
    await this.userService.setUsername(changeUserName, req.user.id);
    return;
  }

  @Post('set_avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './upload',
        filename: UserService.editFileName,
      }),
      limits: { fileSize: 4000000 },
      fileFilter: UserService.imageFileFilter,
    }),
  )
  async setAvatar(
    @UploadedFile() file: Array<Express.Multer.File>,
    @Req() req,
  ): Promise<any> {
    const dir = `${rootPath}${req.user.id}`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }
    fs.rename(file['path'], `${dir}/${req.user.id}.png`, function (err) {
      if (err) {
        throw new InternalServerErrorException();
      } else {
        Logger.log('Successfully moved the file!');
      }
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req): Promise<UserProfileDto> {
    return new UserProfileDto(await this.userService.findUser(req.user.id));
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async searchUser(
    @Req() req,
    @Query() params: SearchUsersDto,
  ): Promise<SearchUsersResultsDto[]> {
    if (params.filter_friends && params.filter_friends == 1) {
      const check = await this.userService.getFriendlist(req.user.id);
      return (await this.userService.searchUsersByUsername(params))
        .filter((res) => {
          return check.findIndex((x) => x.invitedUser.id === res.id) == -1;
        })
        .map((user) => new SearchUsersResultsDto(user));
    }
    return (await this.userService.searchUsersByUsername(params)).map(
      (user) => new SearchUsersResultsDto(user),
    );
  }

  @Post('add_friend')
  @UseGuards(JwtAuthGuard)
  async addUser(
    @Req() req,
    @Body() friend_id: AddFriendDto,
  ): Promise<SearchUsersResultsDto> {
    Logger.log(friend_id);
    if (!friend_id) throw new BadRequestException('Friend should be specified');
    if (friend_id.friend_id == req.user.id)
      throw new ConflictException('You can`t befriend yourself');
    return new SearchUsersResultsDto(
      await this.userService.addFriend(req.user.id, friend_id.friend_id),
    );
  }

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  async getFriends(@Req() req): Promise<SearchUsersResultsDto[]> {
    return (await this.userService.getFriendlist(req.user.id)).map(
      (friendlist) => new SearchUsersResultsDto(friendlist.invitedUser),
    );
  }

  @Delete('delete_friend')
  @UseGuards(JwtAuthGuard)
  async removeFriend(
    @Req() req,
    @Body() friend_id: AddFriendDto,
  ): Promise<boolean> {
    return await this.userService.removeFriend(
      req.user.id,
      friend_id.friend_id,
    );
  }
}

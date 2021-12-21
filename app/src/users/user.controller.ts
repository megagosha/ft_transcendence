import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  InternalServerErrorException,
  Logger,
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
// import { fileTypeFromFile } from 'file-type';

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

  static editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    callback(null, `${req.user.id}${fileExtName}`);
  };

  static imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(
        new UnsupportedMediaTypeException(
          'Only jpg and png files are allowed!',
        ),
        false,
      );
    }
    callback(null, true);
  };

  @Post('set_avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './upload',
        filename: UserController.editFileName,
      }),
      fileFilter: UserController.imageFileFilter,
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
    Logger.log(dir);
    fs.rename(file['path'], `${dir}/${req.user.id}.png`, function (err) {
      if (err) {
        throw new InternalServerErrorException();
      } else {
        Logger.log('Successfully moved the file!');
      }
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req): Promise<UserProfileDto> {
    return new UserProfileDto(await this.userService.findUser(req.user.id));
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async searchUser(@Query() params: SearchUsersDto): Promise<UserProfileDto[]> {
    return (await this.userService.searchUsersByUsername(params)).map(
      (user) => new UserProfileDto(user),
    );
  }
}

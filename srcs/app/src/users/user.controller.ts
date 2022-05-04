import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { join } from "path";

import { AuthService } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UserService } from "./user.service";
import { ChangeUsernameDto } from "./dto/change-username.dto";
import { SearchUsersDto } from "./dto/search-users.dto";
import { User } from "./user.entity";
import { FileInterceptor } from "@nestjs/platform-express";
import { UserProfileDto } from "./dto/user-profile.dto";
import { AvatarDto } from "./dto/avatar.dto";
import { userAvatarsPath } from "../constants";
import { SearchUsersResultsDto } from "./dto/search-users-results.dto";
import { AddFriendDto } from "./dto/add-friend.dto";
import { CurrentUserId } from "../util/user.decarator";
import { writeFile } from "fs";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ChatPageOutDto } from "../chat/dto/chat-page-out.dto";
import { BoolDto } from "./dto/bool.dto";

@ApiTags("user")
@Controller("/api/user")
export class UserController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @ApiOperation({ description: "Изменить имя пользователя" })
  @ApiBody({ type: ChangeUsernameDto })
  @ApiCreatedResponse({
    description: "Имя изменено успешно",
  })
  @ApiConflictResponse({
    description: "Имя уже существует",
  })
  @ApiBadRequestResponse({
    description: "Ошибка запроса. Имя не должно превышать 50 знаков",
  })
  @Post("set_username")
  @UseGuards(JwtAuthGuard)
  async setUsername(
    @Body() changeUserName: ChangeUsernameDto,
    @Req() req
  ): Promise<string> {
    await this.userService.setUsername(changeUserName, req.user.id);
    return;
  }

  @ApiOperation({ description: "Загрузить новую аватарку" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Новый аватар",
    type: AvatarDto,
  })
  @Post("set_avatar")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("avatar", {
      limits: { fileSize: 4000000 },
      fileFilter: UserService.imageFileFilter,
    })
  )
  async setAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUserId() userId: number
  ): Promise<any> {
    const user: User = await this.userService.findUser(userId);
    const contentType: string = file.mimetype;
    let extension: string;
    if (contentType.includes("jpg")) {
      extension = "jpg";
    } else if (contentType.includes("jpeg")) {
      extension = "jpeg";
    } else if (contentType.includes("png")) {
      extension = "png";
    } else {
      throw new BadRequestException(
        "Недопустимый тип файла. Допустимые: png, jpg, jpeg"
      );
    }

    const fileName = `${userId}.${extension}`;

    await writeFile(
      join(userAvatarsPath, fileName),
      file.buffer,
      "binary",
      function (err) {
        if (err) {
          throw new InternalServerErrorException(
            err,
            "Ошибка при загрузке файла"
          );
        }
      }
    );
    user.avatarImgName = fileName;
    await this.userService.saveUser(user);
  }

  @ApiOperation({ description: "Получить профиль текущего пользователя" })
  @ApiOkResponse({ description: "Профиль пользователя", type: UserProfileDto })
  @Get("me")
  @UseGuards(JwtAuthGuard)
  async profile(@Req() req): Promise<UserProfileDto> {
    return new UserProfileDto(await this.userService.findUser(req.user.id));
  }

  @ApiOperation({ description: "Получить профиль пользователя" })
  @ApiQuery({
    name: "userId",
    description: "Id игрока",
    example: "3",
    required: true,
  })
  @ApiOkResponse({ description: "Профиль пользователя", type: UserProfileDto })
  @Get("user")
  @UseGuards(JwtAuthGuard)
  async userInfo(
    @Query() data: { userId: number },
    @CurrentUserId() userId: number
  ): Promise<UserProfileDto> {
    const user = await this.userService.findUser(userId);
    const targetUser = await this.userService.findUser(data.userId);
    if (!user || !targetUser) throw new NotFoundException();
    const blocked: boolean = await this.userService.isBlockedUser(
      user,
      targetUser
    );
    return new UserProfileDto(targetUser, blocked);
  }

  @ApiOperation({ description: "Поиск игрока для добавления в друзья" })
  @ApiQuery({
    name: "params",
    type: SearchUsersDto,
    required: true,
  })
  @ApiOkResponse({ description: "Список игроков", type: SearchUsersResultsDto })
  @Get("search_friend")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  async searchUser(
    @CurrentUserId() userId: number,
    @Query() params: SearchUsersDto
  ): Promise<SearchUsersResultsDto[]> {
    if (params.filter_friends && params.filter_friends == 1) {
      const check = await this.userService.getFriendlist(userId);
      return (await this.userService.searchFriendsToInvite(params, userId))
        .filter((res) => {
          return check.findIndex((x) => x.invitedUser.id === res.id) == -1;
        })
        .map((user) => new SearchUsersResultsDto(user));
    }
    return (await this.userService.searchFriendsToInvite(params, userId)).map(
      (user) => new SearchUsersResultsDto(user)
    );
  }

  @ApiOperation({ description: "Добавить друга" })
  @ApiBody({
    description: "Параметры для добавления друга",
    type: AddFriendDto,
  })
  @ApiOkResponse({ description: "Друг добавлен", type: SearchUsersResultsDto })
  @Post("add_friend")
  @UseGuards(JwtAuthGuard)
  async addUser(
    @CurrentUserId() userId: number,
    @Body() friend_id: AddFriendDto
  ): Promise<SearchUsersResultsDto> {
    if (!friend_id) throw new BadRequestException("Friend should be specified");
    if (friend_id.friend_id == userId) {
      throw new ConflictException("You can`t befriend yourself");
    }
    return new SearchUsersResultsDto(
      await this.userService.addFriend(userId, friend_id.friend_id)
    );
  }

  @ApiOperation({ description: "Получить список друзей" })
  @ApiOkResponse({ description: "Список друзей", type: SearchUsersResultsDto })
  @Get("friends")
  @UseGuards(JwtAuthGuard)
  async getFriends(
    @CurrentUserId() userId: number
  ): Promise<SearchUsersResultsDto[]> {
    return (await this.userService.getFriendlist(userId)).map(
      (friendlist) => new SearchUsersResultsDto(friendlist.invitedUser)
    );
  }

  @ApiOperation({ description: "Удалить друга из списка друзей" })
  @ApiBody({ type: AddFriendDto })
  @ApiOkResponse({ type: BoolDto })
  @Delete("delete_friend")
  @UseGuards(JwtAuthGuard)
  async removeFriend(
    @CurrentUserId() userId: number,
    @Body() friend_id: AddFriendDto
  ): Promise<BoolDto> {
    return {
      result: await this.userService.removeFriend(userId, friend_id.friend_id),
    };
  }
}

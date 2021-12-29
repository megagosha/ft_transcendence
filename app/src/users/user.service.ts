import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { extname } from 'path';
import { rootPath } from '../constants';
import fs = require('fs');
import { Friendship } from './friendlist.entity';
import { use } from 'passport';
import { stringify } from 'querystring';
import { json } from 'express';

// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Friendship)
    private friendlistRepo: Repository<Friendship>,
  ) {}

  async findFtUser(ftId: number, email: string): Promise<User> {
    const user = await this.userRepo.findOne({
      fortytwo_id: ftId,
      email: email,
    });
    if (!user) {
      Logger.log('User with id ' + ftId + ' email ' + email + ' not found');
      return null;
    }
    return user;
  }

  async findUser(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      id: id,
    });
    if (!user) {
      Logger.log('User with id ' + id + ' not found');
      return null;
    }
    return user;
  }

  async createNewUser(createUser: CreateUserDto): Promise<User> {
    const user = new User();
    user.username = createUser.username;
    user.fortytwo_id = createUser.fortytwo_id;
    user.email = createUser.email;
    user.avatarImgName = createUser.avatarImgName;
    Logger.log(
      'New user created ' + createUser.username + ' id ' + user.fortytwo_id,
    );
    return await this.userRepo.save(user);
  }

  async setUsername(
    changeUserName: ChangeUsernameDto,
    id: number,
  ): Promise<any> {
    const user = await this.searchUserByExactUserName(changeUserName.username);
    if (!user)
      return await this.userRepo.update(id, {
        username: changeUserName.username,
      });
    else throw new ConflictException();
  }

  async searchUserByExactUserName(username: string): Promise<User> {
    return await this.userRepo.findOne({ where: { username: username } });
  }

  async searchUsersByUsername(searchUsersDto: SearchUsersDto): Promise<User[]> {
    Logger.log(`Search ${searchUsersDto.username}`);
    return await this.userRepo.find({
      where: {
        username: ILike(searchUsersDto.username + '%'),
      },
      order: {
        username: 'ASC',
      },
      skip: searchUsersDto.skip,
      take: searchUsersDto.take,
    });
  }

  async getFriendlist(user_id: number): Promise<Friendship[]> {
    return await this.friendlistRepo.find({
      where: {
        invitorUser: user_id,
      },
      order: {
        id: 'ASC',
      },
      relations: ['invitedUser'],
    });
  }

  async findFriend(user_id: number, friend_id: number): Promise<Friendship> {
    return await this.friendlistRepo
      .findOne({
        where: {
          invitorUser: user_id,
          invitedUser: friend_id,
        },
        relations: ['invitedUser'],
      })
      .catch((err) => {
        Logger.log(err);
        throw new InternalServerErrorException(
          'Error occured while searching for your friend',
        );
      });
  }

  async isCommonFriend(user_id: number, friend_id: number): Promise<boolean> {
    return !!(
      (await this.findFriend(user_id, friend_id)) &&
      (await this.findFriend(friend_id, user_id))
    );
  }

  async addFriend(user_id: number, friend_id: number): Promise<User> {
    const check = await this.findFriend(user_id, friend_id);
    if (check && check.invitedUser) return check.invitedUser;
    const friend = new Friendship();
    friend.invitorUser = await this.findUser(user_id);
    friend.invitedUser = await this.findUser(friend_id);
    if (!friend.invitedUser || !friend.invitorUser)
      throw new ConflictException('Friend can not be added');
    return (
      await this.friendlistRepo.save(friend).catch((err: any) => {
        throw new ConflictException('Friend can not be added');
      })
    ).invitedUser;
  }

  static editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    callback(null, `${req.user.id}${fileExtName}`);
  };

  static imageFileFilter = (
    req: any,
    file: { originalname: string; size: number },
    callback: (
      arg0: UnsupportedMediaTypeException | PayloadTooLargeException,
      arg1: boolean,
    ) => void,
  ) => {
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

  static getAvatarUrlById(userId: number) {
    let avatarImgName;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    try {
      Logger.log('res ' + `${rootPath}${userId}/${userId}.png`);
      if (fs.existsSync(`${rootPath}${userId}/${userId}.png`)) {
        avatarImgName = `/${userId}/${userId}.png`;
      } else {
        avatarImgName = `/default.png`;
      }
    } catch (err) {
      avatarImgName = `/default.png`;
    }
    return avatarImgName;
  }

  async removeFriend(user_id: number, friend_id: number): Promise<boolean> {
    const res = await this.friendlistRepo
      .findOne({
        where: {
          invitorUser: user_id,
          invitedUser: friend_id,
        },
      })
      .catch((err) => {
        Logger.log(err);
        throw new InternalServerErrorException(
          'Error occured while searching for your friend',
        );
      });
    if (res) {
      await this.friendlistRepo.delete(res).catch((err) => {
        Logger.log(err);
        throw new InternalServerErrorException(
          'Error occured while searching for your friend',
        );
      });
      return true;
    }
    return false;
  }
}

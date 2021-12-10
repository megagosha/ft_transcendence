import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './user.entity';
import { use } from 'passport';
import { CreateUserDto } from './dto/create-user.dto';
import { stringify } from 'querystring';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { SearchUsersDto } from './dto/search-users.dto';
// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
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
    return await this.userRepo.update(id, {
      username: changeUserName.username,
    });
  }

  async searchUsersByUsername(searchUsersDto: SearchUsersDto): Promise<User[]> {
    return await this.userRepo.find({
      where: {
        username: Like(searchUsersDto.username + '%'),
      },
      order: {
        username: 'ASC',
      },
      skip: searchUsersDto.skip,
      take: searchUsersDto.take,
    });
  }
}

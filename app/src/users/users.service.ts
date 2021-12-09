import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { use } from 'passport';
import { CreateUserDto } from './dto/create-user.dto';
import { stringify } from 'querystring';
// This should be a real class/interface representing a user entity
// export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private readonly users = [
    {
      id: 1,
      forty_two_id: 23,
      username: 'john',
      password: 'changeme',
    },
    {
      id: 2,
      forty_two_id: 78275,
      username: 'edebi',
    },
    {},
  ];

  async findOneByFortyTwoId(fortyTwoId: number): Promise<any> {
    return this.users.find((user) => user.forty_two_id === fortyTwoId);
  }

  async findOneByAppId(appId: number, username: string): Promise<any> {
    return this.users.find(
      ((user) => user.username === username) && ((user) => user.id === appId),
    );
  }

  async createNewUser(createUser: CreateUserDto): Promise<any> {
    const user = new User();
    user.username = createUser.username;
    user.fortytwo_id = createUser.fortytwo_id;
    user.email = createUser.email;
    user.avatarImgName = createUser.avatarImgName;
    Logger.log(
      'New user created ' + createUser.username + ' id ' + user.fortytwo_id,
    );
    return this.usersRepository.save(user);
  }
  // async tmpfindOne(fortyTwoId: number, username: string): Promise<any> {
  //   return this.users.find(
  //     ((user) => user.username === username) && ((user) => user.userId === id),
  //   );
  // }
  //
  // async findOne(id: number): Promise<User | undefined> {
  //   // return this.usersRepository.findOne(id);
  // }
  // //@todo if user does not exist in db, create new one. Else get old user.
  // async find42User(user_id: number): Promise<User> {
  //   const user = this.usersRepository.find({ where: { fortytwo_id: user_id } });
  //   if (user) return user[0];
  //   return null;
  // }
}

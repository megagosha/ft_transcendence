import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
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
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 78275,
      username: 'edebi',
    },
    {},
  ];

  async findOne(id: number): Promise<User | undefined> {
    return this.usersRepository.findOne(id);
    // return this.users.find((user) => user.username === username);
  }

  async find42User(user_id: number): Promise<User[]> {
    return this.usersRepository.find({ where: { fortytwo_id: user_id } });
  }
}

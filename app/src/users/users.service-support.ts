import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { Repository } from "typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";

@Injectable()
export class UsersServiceSupport {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) {}

  async findById(id: number, message = "Пользователь не найден"): Promise<User> {
    const user: User = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException(message);
    }
    return user;
  }

  async getCurrentUser(id: number): Promise<User> {
    const user: User = await this.userRepository.findOne(id);
    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }
    user.lastLoginDate = new Date();
    await this.userRepository.save(user);
    return user;
  }

  async findByIds(ids: number[]): Promise<User[]> {
    return this.userRepository.findByIds(ids);
  }
}

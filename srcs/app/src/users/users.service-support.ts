import { InjectRepository } from "@nestjs/typeorm";
import { User } from "./user.entity";
import { In, Like, Not, Repository } from "typeorm";
import { Injectable, NotFoundException } from "@nestjs/common";

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

  async findUsers(ids: number[], name: string, skip: number, take: number): Promise<User[]> {
    return this.userRepository.find({
      where: {
        id: Not(In(ids)),
        username: Like(name + "%"),
      },
      skip: skip,
      take: take,
    });
  }

  static getUserAvatarPath(user: User) {
    return UsersServiceSupport.getUserAvatarPathByImgName(user.avatarImgName);
  }

  static getUserAvatarPathByImgName(avatar: string) {
    if (avatar != null) {
      if (avatar.includes("http")) {
        return avatar;
      }
      return `/files/user/${avatar}`;
    }
    return `/files/user/default.png`;
  }
}

import {Injectable, Logger, NotFoundException} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserSocket } from "./model/user-socket.entity";
import {In, Repository} from "typeorm";
import { User } from "../users/user.entity";
import {Chat} from "./model/chat.entity";

@Injectable()
export class UserSocketServiceSupport {
  constructor(
    @InjectRepository(UserSocket)
    private readonly userSocketRepository: Repository<UserSocket>
  ) {}

  async addUserSocket(user: User, socketId: string): Promise<void> {
    const userSocket: UserSocket = new UserSocket();
    userSocket.id = socketId;
    userSocket.user = user;
    await this.userSocketRepository.save(userSocket);
    Logger.log(`Socket[id=${socketId} for user[id=${user.id}] was created`);
  }

  async removeSocket(socketId: string): Promise<void> {
    await this.userSocketRepository.delete({ id: socketId });
    Logger.log(`Socket[id=${socketId}] was removed`);
  }

  async removeAllSockets() {
    await this.userSocketRepository.clear();
    Logger.log(`All sockets were deleted`);
  }

  async removeSockets(user: User) {
    await this.userSocketRepository.delete({ user: user });
    Logger.log(`Sockets were deleted for user[id=${user.id}]`);
  }

  async findSocket(socketId: string): Promise<UserSocket> {
    const socket: UserSocket = await this.userSocketRepository.findOne(
      socketId,
      { relations: ["user", "activeChat"] }
    );
    if (!socket) {
      throw new NotFoundException("Сокет для пользователя не найден");
    }
    return socket;
  }

  async findSockets(userIds: number[], activeChat: Chat): Promise<UserSocket[]> {
    return this.userSocketRepository.find({
      where: [{ user: In(userIds) }, { activeChat: activeChat }],
      relations: ["user", "activeChat"],
    });
  }
}

import {Injectable, Logger} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "./model/message.entity";
import { Repository } from "typeorm";
import {Chat} from "./model/chat.entity";
import {User} from "../users/user.entity";

@Injectable()
export class MessageServiceSupport {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>
  ) {}

  async addMessage(user: User, chat: Chat, text: string, visible: boolean = true): Promise<Message> {
    const message: Message = new Message();
    message.text = text;
    message.authorUser = user;
    message.targetChat = chat;
    message.visible = visible;
    await this.messageRepository.save(message);

    Logger.log(`Message[id=${message.id}] was added to chat[id=${chat.id}] by user[id=${user.id}]`);

    return message;
  }

  async findMessages(chat: Chat, take: number, skip: number): Promise<Message[]> {
    return this.messageRepository.find({
      where: {
        targetChat: chat,
        visible: true,
      },
      order: {
        dateTimeSend: "DESC",
      },
      take: take,
      skip: skip,
      relations: ["authorUser"],
    });
  }
}

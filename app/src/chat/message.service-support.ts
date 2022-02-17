import {Injectable, Logger} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "./model/message.entity";
import { Repository } from "typeorm";
import {Chat} from "./model/chat.entity";
import {User} from "../users/user.entity";
import {ChatChange} from "./model/chat-change.entity";

@Injectable()
export class MessageServiceSupport {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>
  ) {}

  async addMessage(user: User | null, chat: Chat, text: string | null, chatChange: ChatChange, visible = true): Promise<Message> {
    const message: Message = new Message();
    message.text = text;
    message.authorUser = user;
    message.targetChat = chat;
    message.visible = visible;
    message.chatChange = chatChange;
    await this.messageRepository.save(message);

    Logger.log(`Message[id=${message.id}] was added to chat[id=${chat.id}]`);

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
      relations: ["authorUser", "targetChat", "chatChange"],
    });
  }
}

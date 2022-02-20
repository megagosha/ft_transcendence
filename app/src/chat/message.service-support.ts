import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Message } from "./model/message.entity";
import { In, Not, Repository } from "typeorm";
import { Chat } from "./model/chat.entity";
import { User } from "../users/user.entity";
import { ChatChange } from "./model/chat-change.entity";

@Injectable()
export class MessageServiceSupport {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>
  ) {}

  async addMessage(user: User | null, chat: Chat, text: string | null, chatChange: ChatChange): Promise<Message> {
    const message: Message = new Message();
    message.text = text;
    message.authorUser = user;
    message.targetChat = chat;
    message.chatChange = chatChange;
    await this.messageRepository.save(message);

    Logger.log(`Message[id=${message.id}] was added to chat[id=${chat.id}]`);

    return message;
  }

  async findMessages(chat: Chat, excludeAuthorUsers: User[], take: number, skip: number): Promise<Message[]> {
    const qb = this.messageRepository.createQueryBuilder("message")
      .leftJoinAndSelect("message.authorUser", "user")
      .leftJoinAndSelect("message.targetChat", "chat")
      .leftJoinAndSelect("message.chatChange", "change")
      .leftJoinAndSelect("change.changerUser", "chager")
      .leftJoinAndSelect("change.targetUser", "target")
      .where("message.targetChat = :chat", {chat: chat.id});

    if (excludeAuthorUsers != null && excludeAuthorUsers.length > 0) {
      qb.andWhere("(message.authorUser IS NULL OR message.authorUser NOT IN (:...users))", {users: excludeAuthorUsers.map(u => u.id)});
    }

    return qb.take(take)
      .skip(skip)
      .getMany();
  }
}

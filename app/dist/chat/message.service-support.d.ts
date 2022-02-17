import { Message } from "./model/message.entity";
import { Repository } from "typeorm";
import { Chat } from "./model/chat.entity";
import { User } from "../users/user.entity";
export declare class MessageServiceSupport {
    private readonly messageRepository;
    constructor(messageRepository: Repository<Message>);
    addMessage(user: User, chat: Chat, text: string, visible?: boolean): Promise<Message>;
    findMessages(chat: Chat, take: number, skip: number): Promise<Message[]>;
}

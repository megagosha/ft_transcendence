import { UserSocket } from "./model/user-socket.entity";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { Chat } from "./model/chat.entity";
export declare class UserSocketServiceSupport {
    private readonly userSocketRepository;
    constructor(userSocketRepository: Repository<UserSocket>);
    addUserSocket(user: User, socketId: string): Promise<void>;
    removeSocket(socketId: string): Promise<void>;
    removeAllSockets(): Promise<void>;
    removeSockets(user: User): Promise<void>;
    findSocket(socketId: string): Promise<UserSocket>;
    findSockets(activeChat: Chat): Promise<UserSocket[]>;
}

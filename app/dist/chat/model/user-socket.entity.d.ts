import { User } from "../../users/user.entity";
import { Chat } from "./chat.entity";
export declare class UserSocket {
    static readonly ID_LENGTH: number;
    id: string;
    user: User;
    activeChat: Chat;
}

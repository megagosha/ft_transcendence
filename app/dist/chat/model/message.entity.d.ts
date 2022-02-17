import { User } from "../../users/user.entity";
import { Chat } from "./chat.entity";
export declare class Message {
    static readonly TEXT_LENGTH: number;
    id: number;
    version: number;
    text: string;
    dateTimeSend: Date;
    dateTimeEdit: Date;
    authorUser: User;
    visible: boolean;
    targetChat: Chat;
}

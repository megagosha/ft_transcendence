import { User } from "../../users/user.entity";
import { Chat } from "./chat.entity";
export declare enum UserChatRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    PARTICIPANT = "PARTICIPANT"
}
export declare enum UserChatStatus {
    ACTIVE = "ACTIVE",
    MUTED = "MUTED",
    BANNED = "BANNED"
}
export declare class UserChatLink {
    static readonly USER_CHAT_STATUS_LENGTH: number;
    static readonly USER_CHAT_ROLE_LENGTH: number;
    static readonly SUBSCRIPTION_STATUS_LENGTH: number;
    id: number;
    user: User;
    userStatus: UserChatStatus;
    userRole: UserChatRole;
    chat: Chat;
    dateTimeCreate: Date;
    dateTimeBlockExpire: Date;
    verified: boolean;
}

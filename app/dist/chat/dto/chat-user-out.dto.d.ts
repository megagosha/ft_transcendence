import { UserStatus } from "../../users/user.entity";
import { UserChatRole, UserChatStatus } from "../model/user-chat-link.entity";
export declare class ChatUserOutDto {
    id: number;
    username: string;
    email: string;
    status: UserStatus;
    lastLoginDate: Date;
    userChatStatus: UserChatStatus;
    dateTimeBlockExpire: Date;
    userChatRole: UserChatRole;
    verified: boolean;
}

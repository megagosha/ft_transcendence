import { UserChatRole, UserChatStatus } from "../model/user-chat-link.entity";
export declare class ChatUserUpdateInDto {
    readonly role: UserChatRole;
    readonly status: UserChatStatus;
    readonly dateTimeBlockExpire: Date;
}

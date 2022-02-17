import { ChatType } from "../model/chat.entity";
import { UserChatRole, UserChatStatus } from "../model/user-chat-link.entity";
export declare class ChatBriefOutDto {
    id: number;
    name: string;
    type: ChatType;
    avatar: string;
    userChatStatus: UserChatStatus;
    dateTimeBlockExpire: Date;
    userChatRole: UserChatRole;
    verified: boolean;
}

import { ChatUserOutDto } from "./chat-user-out.dto";
import { ChatBriefOutDto } from "./chat-brief-out.dto";
export declare class MessageOutDto {
    id: number;
    text: string;
    dateTimeSend: Date;
    dateTimeEdit: Date;
    authorUser: ChatUserOutDto;
    targetChat: ChatBriefOutDto;
}

import { ChatBriefOutDto } from "./chat-brief-out.dto";
export declare class ChatPageOutDto {
    readonly chats: ChatBriefOutDto[];
    readonly take: number;
    readonly skip: number;
    constructor(chats: ChatBriefOutDto[], take: number, skip: number);
}

import { ChatUserOutDto } from "./chat-user-out.dto";
export declare class ChatUserPageOutDto {
    users: ChatUserOutDto[];
    take: number;
    readonly skip: number;
    constructor(users: ChatUserOutDto[], take: number, skip: number);
}

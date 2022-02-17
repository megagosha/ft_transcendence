import { ChatType } from "../model/chat.entity";
export declare class ChatCreateInDto {
    readonly type: ChatType;
    readonly name: string;
    readonly description: string;
    readonly password: string;
}

import { ChatType } from "../model/chat.entity";
export declare class ChatAccessUpdateInDto {
    readonly password: string;
    readonly dropVerification: boolean;
    readonly type: ChatType;
}

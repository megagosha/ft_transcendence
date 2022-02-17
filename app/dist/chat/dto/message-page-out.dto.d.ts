import { MessageOutDto } from "./message-out.dto";
export declare class MessagePageOutDto {
    readonly messages: MessageOutDto[];
    readonly take: number;
    readonly skip: number;
    constructor(messages: MessageOutDto[], take: number, skip: number);
}

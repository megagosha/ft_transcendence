import { ChatType } from "../model/chat.entity";
export declare class ChatOutDto {
    id: number;
    name: string;
    description: string;
    type: ChatType;
    dateTimeCreate: Date;
    dateTimePasswordChange: Date;
    avatar: string;
    userCount: number;
}

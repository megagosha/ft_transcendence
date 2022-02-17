import { User } from "../../users/user.entity";
export declare enum ChatType {
    PROTECTED = "PROTECTED",
    PUBLIC = "PUBLIC",
    PRIVATE = "PRIVATE",
    DIRECT = "DIRECT"
}
export declare class Chat {
    static readonly NAME_LENGTH: number;
    static readonly TYPE_LENGTH: number;
    static readonly PASSWORD_LENGTH: number;
    static readonly DESCRIPTION_LENGTH: number;
    id: number;
    version: number;
    name: string;
    description: string;
    dateTimeCreate: Date;
    type: ChatType;
    password: string;
    dateTimePasswordChange: Date;
    avatar: string;
    ownerUser: User;
    dateTimeLastAction: Date;
}

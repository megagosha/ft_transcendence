import { UserBriefOutDto } from "./user-brief-out-dto";
export declare class UserBriefPageOutDto {
    users: UserBriefOutDto[];
    take: number;
    readonly skip: number;
    constructor(users: UserBriefOutDto[], take: number, skip: number);
}

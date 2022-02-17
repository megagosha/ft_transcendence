import { User } from '../user.entity';
export declare class SearchUsersResultsDto {
    id: number;
    username: string;
    avatarImgName: string;
    status: string;
    constructor(user: User);
}

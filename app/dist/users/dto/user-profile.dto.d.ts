import { Friendship } from '../friendlist.entity';
import { User, UserStatus } from '../user.entity';
export declare class UserProfileDto {
    constructor(user: User);
    id: number;
    username: string;
    email: string;
    registerDate: Date;
    lastLoginDate: Date;
    status: UserStatus;
    avatarImgName: string;
    isTwoAuth: boolean;
    invitorFriendships: Friendship[];
    invitedFriendships: Friendship[];
}

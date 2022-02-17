import { UserStatistics } from '../game/gamestats.entity';
import { Friendship } from './friendlist.entity';
export declare enum UserStatus {
    ONLINE = "ONLINE",
    OFFLINE = "OFFLINE",
    ACTIVE = "ACTIVE",
    DISABLED = "DISABLED"
}
export declare class User {
    static readonly USERNAME_LENGTH: number;
    static readonly PASSWORD_LENGTH: number;
    static readonly USER_STATUS_LENGTH: number;
    static readonly AVATAR_IMG_NAME_LENGTH: number;
    id: number;
    version: number;
    username: string;
    fortytwo_id: number;
    google_id: string;
    twoAuth: string;
    email: string;
    password: string;
    registerDate: Date;
    lastLoginDate: Date;
    status: UserStatus;
    avatarImgName: string;
    statistic: UserStatistics;
    invitorFriendships: Friendship[];
    invitedFriendships: Friendship[];
}

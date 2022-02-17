import { User } from './user.entity';
export declare class Friendship {
    id: number;
    invitorUser: User;
    invitedUser: User;
    beginDate: Date;
    friends: boolean;
}

import { PayloadTooLargeException, UnsupportedMediaTypeException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User, UserStatus } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { Friendship } from './friendlist.entity';
export declare class UserService {
    private userRepo;
    private friendlistRepo;
    constructor(userRepo: Repository<User>, friendlistRepo: Repository<Friendship>);
    saveUser(user: User): Promise<void>;
    findFtUser(ftId: number, email: string): Promise<User>;
    findWithEmail(email: string): Promise<User>;
    findUser(id: number): Promise<User>;
    createNewUser(createUser: CreateUserDto): Promise<User>;
    setUsername(changeUserName: ChangeUsernameDto, id: number): Promise<any>;
    searchUserByExactUserName(username: string): Promise<User>;
    searchUsersByUsername(searchUsersDto: SearchUsersDto): Promise<User[]>;
    getFriendlist(user_id: number): Promise<Friendship[]>;
    findFriend(user_id: number, friend_id: number): Promise<Friendship>;
    isCommonFriend(user_id: number, friend_id: number): Promise<boolean>;
    addFriend(user_id: number, friend_id: number): Promise<User>;
    static editFileName: (req: any, file: any, callback: any) => void;
    static imageFileFilter: (req: any, file: {
        originalname: string;
        size: number;
    }, callback: (arg0: UnsupportedMediaTypeException | PayloadTooLargeException, arg1: boolean) => void) => void;
    static getAvatarUrlById(userId: number): any;
    removeFriend(user_id: number, friend_id: number): Promise<boolean>;
    setStatus(userId: number, status: UserStatus): void;
    setTwoFactor(secret: string, userId: number): Promise<import("typeorm").UpdateResult>;
    removeTwoFactor(userId: number): Promise<import("typeorm").UpdateResult>;
}

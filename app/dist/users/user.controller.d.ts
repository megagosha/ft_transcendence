/// <reference types="multer" />
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';
import { ChangeUsernameDto } from './dto/change-username.dto';
import { SearchUsersDto } from './dto/search-users.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { SearchUsersResultsDto } from './dto/search-users-results.dto';
import { AddFriendDto } from './dto/add-friend.dto';
export declare class UserController {
    private authService;
    private userService;
    constructor(authService: AuthService, userService: UserService);
    setUsername(changeUserName: ChangeUsernameDto, req: any): Promise<string>;
    setAvatar(file: Express.Multer.File, userId: number): Promise<any>;
    profile(req: any): Promise<UserProfileDto>;
    userInfo(data: {
        userId: number;
    }): Promise<UserProfileDto>;
    searchUser(req: any, params: SearchUsersDto): Promise<SearchUsersResultsDto[]>;
    addUser(req: any, friend_id: AddFriendDto): Promise<SearchUsersResultsDto>;
    getFriends(req: any): Promise<SearchUsersResultsDto[]>;
    removeFriend(req: any, friend_id: AddFriendDto): Promise<boolean>;
}

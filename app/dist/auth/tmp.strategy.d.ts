import { Strategy } from 'passport-jwt';
import { UserService } from '../users/user.service';
declare const TmpStrategy_base: new (...args: any[]) => Strategy;
export declare class TmpStrategy extends TmpStrategy_base {
    private _userService;
    constructor(_userService: UserService);
    validate(payload: any): Promise<any>;
}
export {};

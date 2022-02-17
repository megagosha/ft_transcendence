import { AuthService } from './auth.service';
import { UserService } from '../users/user.service';
export declare class AuthController {
    private authService;
    private userService;
    constructor(authService: AuthService, userService: UserService);
    ftAuth(req: any): Promise<void>;
    googleAuth(req: any): Promise<void>;
    getUserFromFtLogin(req: any, res: any): Promise<any>;
    getUserFromGoogleLogin(req: any, res: any): Promise<any>;
    twoAuthLogin(req: any, code: {
        code: string;
    }): Promise<any>;
    generate(response: any, req: any, data: {
        userId: number;
    }): Promise<any>;
    disable(req: any): Promise<any>;
}

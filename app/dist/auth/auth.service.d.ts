import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
export declare class AuthService {
    private userRepo;
    private usersService;
    private jwtService;
    constructor(userRepo: Repository<User>, usersService: UserService, jwtService: JwtService);
    jwtLogin(id: number, username: string): string;
    decodeJwtToken(token: string): User;
    tmpLogin(id: number, username: string): Promise<string>;
    generateTwoAuthSecret(user: User): Promise<{
        secret: string;
        otpauthUrl: string;
    }>;
    isTwoAuthValid(twoAuthCode: string, user: User): boolean;
    pipeQrCodeStream(response: Response, otpUrl: string): any;
}

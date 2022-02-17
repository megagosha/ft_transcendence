import { User } from "./user.entity";
import { Repository } from "typeorm";
export declare class UsersServiceSupport {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    findById(id: number, message?: string): Promise<User>;
    getCurrentUser(id: number): Promise<User>;
    findByIds(ids: number[]): Promise<User[]>;
    findUsers(ids: number[], name: string, skip: number, take: number): Promise<User[]>;
    static getUserAvatarPath(user: User): string;
}

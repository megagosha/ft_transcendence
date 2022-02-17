export declare class SecurityUtil {
    static hashPassword(pass: string): string;
    static checkPassword(pass: string, hashPass: any): boolean;
}

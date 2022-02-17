import { ExecutionContext } from '@nestjs/common';
declare const SocketAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class SocketAuthGuard extends SocketAuthGuard_base {
    getRequest<T = any>(context: ExecutionContext): T;
}
export {};

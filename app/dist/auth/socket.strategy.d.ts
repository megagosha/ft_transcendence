import { Strategy } from 'passport-jwt';
declare const SocketStrategy_base: new (...args: any[]) => Strategy;
export declare class SocketStrategy extends SocketStrategy_base {
    constructor();
    validate(payload: any): Promise<any>;
}
export {};

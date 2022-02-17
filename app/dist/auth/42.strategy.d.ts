/// <reference types="passport-oauth2" />
import { HttpService } from '@nestjs/common';
import { AuthService } from './auth.service';
declare const FortyTwoStrategy_base: new (...args: any[]) => import("passport-oauth2");
export declare class FortyTwoStrategy extends FortyTwoStrategy_base {
    private authService;
    private http;
    constructor(authService: AuthService, http: HttpService);
    validate(accessToken: string): Promise<any>;
}
export {};

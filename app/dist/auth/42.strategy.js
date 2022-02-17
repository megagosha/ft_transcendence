"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FortyTwoStrategy = void 0;
const passport_1 = require("@nestjs/passport");
const common_1 = require("@nestjs/common");
const passport_oauth2_1 = require("passport-oauth2");
const auth_service_1 = require("./auth.service");
const querystring_1 = require("querystring");
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const callbackURL = process.env.CALLBACK_URL;
let FortyTwoStrategy = class FortyTwoStrategy extends (0, passport_1.PassportStrategy)(passport_oauth2_1.Strategy, 'fortytwo') {
    constructor(authService, http) {
        super({
            authorizationURL: `https://api.intra.42.fr/oauth/authorize?${(0, querystring_1.stringify)({
                client_id: clientID,
                redirect_uri: callbackURL,
                response_type: 'code',
                scope: 'public',
            })}`,
            tokenURL: 'https://api.intra.42.fr/oauth/token',
            scope: 'public',
            clientID,
            clientSecret,
            callbackURL,
        });
        this.authService = authService;
        this.http = http;
    }
    async validate(accessToken) {
        const { data } = await this.http
            .get('https://api.intra.42.fr/v2/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })
            .toPromise();
        if (!data || !data.id) {
            throw new common_1.UnauthorizedException();
        }
        return {
            id: data.id,
            email: data.email,
            login: data.login,
            username: data.login,
            image_url: data.image_url,
        };
    }
};
FortyTwoStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [auth_service_1.AuthService, common_1.HttpService])
], FortyTwoStrategy);
exports.FortyTwoStrategy = FortyTwoStrategy;
//# sourceMappingURL=42.strategy.js.map
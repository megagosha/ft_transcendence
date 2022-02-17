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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const auth_service_1 = require("./auth.service");
const json_1 = require("ts-jest/dist/utils/json");
const user_service_1 = require("../users/user.service");
const create_user_dto_1 = require("../users/dto/create-user.dto");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
const tmp_auth_guard_1 = require("./tmp-auth.guard");
let AuthController = class AuthController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    async ftAuth(req) {
        return;
    }
    async googleAuth(req) {
        return;
    }
    async getUserFromFtLogin(req, res) {
        common_1.Logger.log((0, json_1.stringify)(req.user));
        let user = await this.userService.findFtUser(req.user.id, req.user.email);
        if (user == null) {
            common_1.Logger.log('User not found in database! Creating new user...');
            const newUser = new create_user_dto_1.CreateUserDto();
            newUser.email = req.user.email;
            newUser.username = req.user.username;
            newUser.fortytwo_id = req.user.id;
            newUser.avatarImgName = req.user.image_url;
            user = await this.userService.createNewUser(newUser);
        }
        else if (user.twoAuth != null) {
            const jwt = await this.authService.tmpLogin(user.id, user.username);
            return res.redirect('http://localhost:4200/login/otp/?token=' + jwt);
        }
        const jwt = await this.authService.jwtLogin(user.id, user.username);
        return res.redirect('http://localhost:4200/login/success/?token=' + jwt);
    }
    async getUserFromGoogleLogin(req, res) {
        let user = await this.userService.findWithEmail(req.user.email);
        if (user == null) {
            const newUser = new create_user_dto_1.CreateUserDto();
            newUser.email = req.user.email;
            newUser.username = req.user.username;
            newUser.google_id = req.user.id;
            newUser.avatarImgName = req.user.image_url;
            user = await this.userService.createNewUser(newUser);
        }
        else if (user.twoAuth != null) {
            console.log('here');
            const jwt = await this.authService.tmpLogin(user.id, user.username);
            return res.redirect('http://localhost:4200/login/otp/?token=' + jwt);
        }
        const jwt = await this.authService.jwtLogin(user.id, user.username);
        return res.redirect('http://localhost:4200/login/success/?token=' + jwt);
    }
    async twoAuthLogin(req, code) {
        const user = await this.userService.findUser(req.user.id);
        const isCodeValid = this.authService.isTwoAuthValid(code.code, user);
        console.log(isCodeValid);
        if (!isCodeValid)
            throw new common_1.UnauthorizedException('Wrong code');
        return { token: this.authService.jwtLogin(req.user.id, req.user.username) };
    }
    async generate(response, req, data) {
        console.log(req.user);
        const user = await this.userService.findUser(req.user.id);
        console.log(user);
        const result = await this.authService.generateTwoAuthSecret(user);
        return this.authService.pipeQrCodeStream(response, result.otpauthUrl);
    }
    async disable(req) {
        return await this.userService.removeTwoFactor(req.user.id);
    }
};
__decorate([
    (0, common_1.Get)('ft'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('fortytwo')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ftAuth", null);
__decorate([
    (0, common_1.Get)('google'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('ft/redirect'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('fortytwo')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserFromFtLogin", null);
__decorate([
    (0, common_1.Get)('google/redirect'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getUserFromGoogleLogin", null);
__decorate([
    (0, common_1.Post)('2auth/login'),
    (0, common_1.UseGuards)(tmp_auth_guard_1.TmpAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "twoAuthLogin", null);
__decorate([
    (0, common_1.Post)('2auth/generate'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('2auth/disable'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disable", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map
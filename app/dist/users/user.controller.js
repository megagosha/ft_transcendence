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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const auth_service_1 = require("../auth/auth.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const user_service_1 = require("./user.service");
const change_username_dto_1 = require("./dto/change-username.dto");
const search_users_dto_1 = require("./dto/search-users.dto");
const platform_express_1 = require("@nestjs/platform-express");
const user_profile_dto_1 = require("./dto/user-profile.dto");
const constants_1 = require("../constants");
const search_users_results_dto_1 = require("./dto/search-users-results.dto");
const add_friend_dto_1 = require("./dto/add-friend.dto");
const user_decarator_1 = require("../util/user.decarator");
const fs_1 = require("fs");
let UserController = class UserController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    async setUsername(changeUserName, req) {
        await this.userService.setUsername(changeUserName, req.user.id);
        return;
    }
    async setAvatar(file, userId) {
        const user = await this.userService.findUser(userId);
        const contentType = file.mimetype;
        let extension;
        if (contentType.includes("jpg")) {
            extension = "jpg";
        }
        else if (contentType.includes("jpeg")) {
            extension = "jpeg";
        }
        else if (contentType.includes("png")) {
            extension = "png";
        }
        else {
            throw new common_1.BadRequestException("Недопустимый тип файла. Допустимые: png, jpg, jpeg");
        }
        const fileName = `${userId}.${extension}`;
        await (0, fs_1.writeFile)((0, path_1.join)(constants_1.userAvatarsPath, fileName), file.buffer, "binary", function (err) {
            if (err) {
                throw new common_1.InternalServerErrorException(err, "Ошибка при загрузке файла");
            }
        });
        user.avatarImgName = fileName;
        this.userService.saveUser(user);
    }
    async profile(req) {
        return new user_profile_dto_1.UserProfileDto(await this.userService.findUser(req.user.id));
    }
    async userInfo(data) {
        const res = await this.userService.findUser(data.userId);
        if (!res)
            throw new common_1.NotFoundException();
        return new user_profile_dto_1.UserProfileDto(res);
    }
    async searchUser(req, params) {
        if (params.filter_friends && params.filter_friends == 1) {
            const check = await this.userService.getFriendlist(req.user.id);
            return (await this.userService.searchUsersByUsername(params))
                .filter((res) => {
                return check.findIndex((x) => x.invitedUser.id === res.id) == -1;
            })
                .map((user) => new search_users_results_dto_1.SearchUsersResultsDto(user));
        }
        return (await this.userService.searchUsersByUsername(params)).map((user) => new search_users_results_dto_1.SearchUsersResultsDto(user));
    }
    async addUser(req, friend_id) {
        common_1.Logger.log(friend_id);
        if (!friend_id)
            throw new common_1.BadRequestException('Friend should be specified');
        if (friend_id.friend_id == req.user.id)
            throw new common_1.ConflictException('You can`t befriend yourself');
        return new search_users_results_dto_1.SearchUsersResultsDto(await this.userService.addFriend(req.user.id, friend_id.friend_id));
    }
    async getFriends(req) {
        return (await this.userService.getFriendlist(req.user.id)).map((friendlist) => new search_users_results_dto_1.SearchUsersResultsDto(friendlist.invitedUser));
    }
    async removeFriend(req, friend_id) {
        return await this.userService.removeFriend(req.user.id, friend_id.friend_id);
    }
};
__decorate([
    (0, common_1.Post)('set_username'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_username_dto_1.ChangeUsernameDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "setUsername", null);
__decorate([
    (0, common_1.Post)('set_avatar'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar', {
        limits: { fileSize: 4000000 },
        fileFilter: user_service_1.UserService.imageFileFilter,
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, user_decarator_1.CurrentUserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "setAvatar", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "profile", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "userInfo", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, search_users_dto_1.SearchUsersDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "searchUser", null);
__decorate([
    (0, common_1.Post)('add_friend'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_friend_dto_1.AddFriendDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "addUser", null);
__decorate([
    (0, common_1.Get)('friends'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getFriends", null);
__decorate([
    (0, common_1.Delete)('delete_friend'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_friend_dto_1.AddFriendDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "removeFriend", null);
UserController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map
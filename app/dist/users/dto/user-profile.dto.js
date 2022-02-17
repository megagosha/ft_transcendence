"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileDto = void 0;
const common_1 = require("@nestjs/common");
const users_service_support_1 = require("../users.service-support");
class UserProfileDto {
    constructor(user) {
        this.id = user.id;
        this.username = user.username;
        this.email = user.email;
        this.registerDate = user.registerDate;
        this.lastLoginDate = user.lastLoginDate;
        this.status = user.status;
        this.invitedFriendships = user.invitedFriendships;
        this.invitorFriendships = user.invitorFriendships;
        this.avatarImgName = users_service_support_1.UsersServiceSupport.getUserAvatarPath(user);
        this.isTwoAuth = user.twoAuth != null;
        common_1.Logger.log('Avatar is set to ' + this.avatarImgName);
    }
}
exports.UserProfileDto = UserProfileDto;
//# sourceMappingURL=user-profile.dto.js.map
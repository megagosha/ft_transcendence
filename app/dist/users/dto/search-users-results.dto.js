"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchUsersResultsDto = void 0;
const users_service_support_1 = require("../users.service-support");
class SearchUsersResultsDto {
    constructor(user) {
        this.id = user.id;
        this.username = user.username;
        this.status = user.status;
        this.avatarImgName = users_service_support_1.UsersServiceSupport.getUserAvatarPath(user);
    }
}
exports.SearchUsersResultsDto = SearchUsersResultsDto;
//# sourceMappingURL=search-users-results.dto.js.map
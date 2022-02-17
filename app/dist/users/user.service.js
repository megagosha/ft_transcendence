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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const path_1 = require("path");
const constants_1 = require("../constants");
const fs = require("fs");
const friendlist_entity_1 = require("./friendlist.entity");
let UserService = class UserService {
    constructor(userRepo, friendlistRepo) {
        this.userRepo = userRepo;
        this.friendlistRepo = friendlistRepo;
    }
    async saveUser(user) {
        await this.userRepo.save(user);
    }
    async findFtUser(ftId, email) {
        const user = await this.userRepo.findOne({
            fortytwo_id: ftId,
            email: email,
        });
        if (!user) {
            common_1.Logger.log('User with id ' + ftId + ' email ' + email + ' not found');
            return null;
        }
        return user;
    }
    async findWithEmail(email) {
        const user = await this.userRepo.findOne({
            email: email,
        });
        if (!user)
            return null;
        return user;
    }
    async findUser(id) {
        const user = await this.userRepo.findOne({
            id: id,
        });
        if (!user) {
            common_1.Logger.log('User with id ' + id + ' not found');
            return null;
        }
        return user;
    }
    async createNewUser(createUser) {
        const user = new user_entity_1.User();
        user.username = createUser.username;
        user.fortytwo_id = createUser.fortytwo_id;
        user.google_id = createUser.google_id;
        user.email = createUser.email;
        user.avatarImgName = createUser.avatarImgName;
        common_1.Logger.log('New user created ' + createUser.username + ' id ' + user.fortytwo_id);
        return await this.userRepo.save(user);
    }
    async setUsername(changeUserName, id) {
        const user = await this.searchUserByExactUserName(changeUserName.username);
        if (!user)
            return await this.userRepo.update(id, {
                username: changeUserName.username,
            });
        else
            throw new common_1.ConflictException();
    }
    async searchUserByExactUserName(username) {
        return await this.userRepo.findOne({ where: { username: username } });
    }
    async searchUsersByUsername(searchUsersDto) {
        common_1.Logger.log(`Search ${searchUsersDto.username}`);
        return await this.userRepo.find({
            where: {
                username: (0, typeorm_2.ILike)(searchUsersDto.username + '%'),
            },
            order: {
                username: 'ASC',
            },
            skip: searchUsersDto.skip,
            take: searchUsersDto.take,
        });
    }
    async getFriendlist(user_id) {
        return await this.friendlistRepo.find({
            where: {
                invitorUser: user_id,
            },
            order: {
                id: 'ASC',
            },
            relations: ['invitedUser'],
        });
    }
    async findFriend(user_id, friend_id) {
        return await this.friendlistRepo
            .findOne({
            where: {
                invitorUser: user_id,
                invitedUser: friend_id,
            },
            relations: ['invitedUser'],
        })
            .catch((err) => {
            common_1.Logger.log(err);
            throw new common_1.InternalServerErrorException('Error occured while searching for your friend');
        });
    }
    async isCommonFriend(user_id, friend_id) {
        return !!((await this.findFriend(user_id, friend_id)) &&
            (await this.findFriend(friend_id, user_id)));
    }
    async addFriend(user_id, friend_id) {
        const check = await this.findFriend(user_id, friend_id);
        if (check && check.invitedUser)
            return check.invitedUser;
        const friend = new friendlist_entity_1.Friendship();
        friend.invitorUser = await this.findUser(user_id);
        friend.invitedUser = await this.findUser(friend_id);
        if (!friend.invitedUser || !friend.invitorUser)
            throw new common_1.ConflictException('Friend can not be added');
        return (await this.friendlistRepo.save(friend).catch((err) => {
            throw new common_1.ConflictException('Friend can not be added');
        })).invitedUser;
    }
    static getAvatarUrlById(userId) {
        let avatarImgName;
        try {
            common_1.Logger.log('res ' + `${constants_1.rootPath}${userId}/${userId}.png`);
            if (fs.existsSync(`${constants_1.rootPath}${userId}/${userId}.png`)) {
                avatarImgName = `/${userId}/${userId}.png`;
            }
            else {
                avatarImgName = `/default.png`;
            }
        }
        catch (err) {
            avatarImgName = `/default.png`;
        }
        return avatarImgName;
    }
    async removeFriend(user_id, friend_id) {
        const res = await this.friendlistRepo
            .findOne({
            where: {
                invitorUser: user_id,
                invitedUser: friend_id,
            },
        })
            .catch((err) => {
            common_1.Logger.log(err);
            throw new common_1.InternalServerErrorException('Error occured while searching for your friend');
        });
        if (res) {
            await this.friendlistRepo.delete(res).catch((err) => {
                common_1.Logger.log(err);
                throw new common_1.InternalServerErrorException('Error occured while searching for your friend');
            });
            return true;
        }
        return false;
    }
    setStatus(userId, status) {
        this.userRepo.update(userId, {
            status: status,
        });
    }
    async setTwoFactor(secret, userId) {
        return this.userRepo.update(userId, {
            twoAuth: secret,
        });
    }
    async removeTwoFactor(userId) {
        return this.userRepo.update(userId, {
            twoAuth: null,
        });
    }
};
UserService.editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = (0, path_1.extname)(file.originalname);
    callback(null, `${req.user.id}${fileExtName}`);
};
UserService.imageFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        return callback(new common_1.UnsupportedMediaTypeException('Only jpg and png files are allowed!'), false);
    }
    callback(null, true);
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(friendlist_entity_1.Friendship)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
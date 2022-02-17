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
var User_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = exports.UserStatus = void 0;
const typeorm_1 = require("typeorm");
const gamestats_entity_1 = require("../game/gamestats.entity");
const friendlist_entity_1 = require("./friendlist.entity");
const class_transformer_1 = require("class-transformer");
var UserStatus;
(function (UserStatus) {
    UserStatus["ONLINE"] = "ONLINE";
    UserStatus["OFFLINE"] = "OFFLINE";
    UserStatus["ACTIVE"] = "ACTIVE";
    UserStatus["DISABLED"] = "DISABLED";
})(UserStatus = exports.UserStatus || (exports.UserStatus = {}));
let User = User_1 = class User {
    constructor() {
        this.statistic = new gamestats_entity_1.UserStatistics();
    }
};
User.USERNAME_LENGTH = 120;
User.PASSWORD_LENGTH = 65;
User.USER_STATUS_LENGTH = 15;
User.AVATAR_IMG_NAME_LENGTH = 100;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.VersionColumn)(),
    __metadata("design:type", Number)
], User.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: User_1.USERNAME_LENGTH, nullable: false, unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "fortytwo_id", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.Column)('varchar', { unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "google_id", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "twoAuth", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: false }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, class_transformer_1.Exclude)(),
    (0, typeorm_1.Column)({ length: User_1.PASSWORD_LENGTH, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        nullable: false,
        update: false,
        insert: false,
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP',
    }),
    __metadata("design:type", Date)
], User.prototype, "registerDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        nullable: false,
        precision: 3,
        default: () => 'CURRENT_TIMESTAMP(3)',
        onUpdate: 'CURRENT_TIMESTAMP(3)',
    }),
    __metadata("design:type", Date)
], User.prototype, "lastLoginDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        length: User_1.USER_STATUS_LENGTH,
        nullable: false,
        default: UserStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: User_1.AVATAR_IMG_NAME_LENGTH, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatarImgName", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => gamestats_entity_1.UserStatistics, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'game_statistic_id', referencedColumnName: 'id' }),
    __metadata("design:type", gamestats_entity_1.UserStatistics)
], User.prototype, "statistic", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendlist_entity_1.Friendship, (friendship) => friendship.invitorUser),
    __metadata("design:type", Array)
], User.prototype, "invitorFriendships", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friendlist_entity_1.Friendship, (friendship) => friendship.invitedUser),
    __metadata("design:type", Array)
], User.prototype, "invitedFriendships", void 0);
User = User_1 = __decorate([
    (0, typeorm_1.Entity)({ name: 'ft_user' })
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map
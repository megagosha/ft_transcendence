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
exports.Friendship = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let Friendship = class Friendship {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Friendship.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'invitor_user_id', referencedColumnName: 'id' }),
    __metadata("design:type", user_entity_1.User)
], Friendship.prototype, "invitorUser", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'invited_user_id', referencedColumnName: 'id' }),
    __metadata("design:type", user_entity_1.User)
], Friendship.prototype, "invitedUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Friendship.prototype, "beginDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false, default: false }),
    __metadata("design:type", Boolean)
], Friendship.prototype, "friends", void 0);
Friendship = __decorate([
    (0, typeorm_1.Entity)('ft_friendship'),
    (0, typeorm_1.Index)('friendship_invitor_invited_index', ['invitorUser', 'invitedUser'], {
        unique: true,
    }),
    (0, typeorm_1.Index)('friendship_invitor_index', ['invitorUser']),
    (0, typeorm_1.Index)('friendship_invited_index', ['invitedUser'])
], Friendship);
exports.Friendship = Friendship;
//# sourceMappingURL=friendlist.entity.js.map
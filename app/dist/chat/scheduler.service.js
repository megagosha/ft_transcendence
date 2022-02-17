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
exports.SchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const chat_service_support_1 = require("./chat.service-support");
let SchedulerService = class SchedulerService {
    constructor(chatServiceSupport) {
        this.chatServiceSupport = chatServiceSupport;
    }
    async unblockUserChatLinks() {
        common_1.Logger.log("Unblock user chat links start");
        await this.chatServiceSupport.unblockUserChatLinks(new Date());
        common_1.Logger.log("Unblock user chat links end");
    }
};
__decorate([
    (0, schedule_1.Cron)("0 0 0 * * *"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SchedulerService.prototype, "unblockUserChatLinks", null);
SchedulerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [chat_service_support_1.ChatServiceSupport])
], SchedulerService);
exports.SchedulerService = SchedulerService;
//# sourceMappingURL=scheduler.service.js.map
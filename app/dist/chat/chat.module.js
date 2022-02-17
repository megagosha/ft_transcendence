"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_module_1 = require("../users/user.module");
const chat_service_1 = require("./chat.service");
const chat_controller_1 = require("./chat.controller");
const auth_module_1 = require("../auth/auth.module");
const user_chat_link_entity_1 = require("./model/user-chat-link.entity");
const message_entity_1 = require("./model/message.entity");
const chat_entity_1 = require("./model/chat.entity");
const chat_service_support_1 = require("./chat.service-support");
const chat_gateway_1 = require("./chat.gateway");
const user_socket_service_support_1 = require("./user-socket.service-support");
const user_socket_entity_1 = require("./model/user-socket.entity");
const socket_validation_pipe_1 = require("./socket.validation-pipe");
const message_service_support_1 = require("./message.service-support");
const scheduler_service_1 = require("./scheduler.service");
let ChatModule = class ChatModule {
};
ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([chat_entity_1.Chat, user_chat_link_entity_1.UserChatLink, message_entity_1.Message, user_socket_entity_1.UserSocket]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
        ],
        providers: [
            chat_service_1.ChatService,
            chat_service_support_1.ChatServiceSupport,
            chat_gateway_1.ChatGateway,
            user_socket_service_support_1.UserSocketServiceSupport,
            socket_validation_pipe_1.SocketValidationPipe,
            message_service_support_1.MessageServiceSupport,
            scheduler_service_1.SchedulerService,
        ],
        controllers: [chat_controller_1.ChatController],
        exports: [chat_service_1.ChatService, chat_service_support_1.ChatServiceSupport],
    })
], ChatModule);
exports.ChatModule = ChatModule;
//# sourceMappingURL=chat.module.js.map
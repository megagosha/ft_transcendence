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
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const users_service_support_1 = require("../users/users.service-support");
const user_socket_service_support_1 = require("./user-socket.service-support");
const socket_exception_filter_1 = require("./socket.exception-filter");
const user_socket_entity_1 = require("./model/user-socket.entity");
const user_chat_link_entity_1 = require("./model/user-chat-link.entity");
const chat_entity_1 = require("./model/chat.entity");
const chat_service_support_1 = require("./chat.service-support");
const message_service_support_1 = require("./message.service-support");
const message_out_dto_1 = require("./dto/message-out.dto");
const class_transformer_1 = require("class-transformer");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const socket_validation_pipe_1 = require("./socket.validation-pipe");
const page_dto_1 = require("./dto/page.dto");
const message_page_out_dto_1 = require("./dto/message-page-out.dto");
let ChatGateway = class ChatGateway {
    constructor(authService, usersServiceSupport, userSocketServiceSupport, chatServiceSupport, messageServiceSupport, socketRepository) {
        this.authService = authService;
        this.usersServiceSupport = usersServiceSupport;
        this.userSocketServiceSupport = userSocketServiceSupport;
        this.chatServiceSupport = chatServiceSupport;
        this.messageServiceSupport = messageServiceSupport;
        this.socketRepository = socketRepository;
    }
    async onModuleInit() {
        await this.userSocketServiceSupport.removeAllSockets();
    }
    async handleConnection(client) {
        let user;
        try {
            const userId = this.getCurrentUserId(client);
            user = await this.usersServiceSupport.getCurrentUser(userId);
        }
        catch (e) {
            return;
        }
        await this.userSocketServiceSupport.addUserSocket(user, client.id);
    }
    async handleDisconnect(client) {
        await this.userSocketServiceSupport.removeSocket(client.id);
    }
    async onEnterChat(chatId, client) {
        const userId = this.getCurrentUserId(client);
        const user = await this.usersServiceSupport.getCurrentUser(userId);
        const chat = await this.chatServiceSupport.findChatById(chatId);
        let userChatLink = await this.chatServiceSupport.findUserChatLink(user, chat, false);
        if (userChatLink == null) {
            userChatLink = new user_chat_link_entity_1.UserChatLink();
            userChatLink.chat = chat;
        }
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.ENTER_CHAT);
        const socket = await this.userSocketServiceSupport.findSocket(client.id);
        socket.activeChat = chat;
        await this.socketRepository.save(socket);
        const messagePage = await this.getMessagePage(chat, 20, 0);
        client.emit("/message/page-receive", messagePage);
    }
    async onSendMessage(text, client) {
        const userId = this.getCurrentUserId(client);
        const user = await this.usersServiceSupport.getCurrentUser(userId);
        const socket = await this.userSocketServiceSupport.findSocket(client.id);
        const activeChat = socket.activeChat;
        if (activeChat == null) {
            throw new websockets_1.WsException("Необходимо присоединиться к чату");
        }
        const userChatLink = await this.chatServiceSupport.findUserChatLink(user, activeChat);
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.SEND_MESSAGE);
        let visible;
        if (activeChat.type == chat_entity_1.ChatType.DIRECT) {
            const secondUserChatLink = await this.chatServiceSupport.findSecondChatLink(user, activeChat);
            if (secondUserChatLink.userStatus == user_chat_link_entity_1.UserChatStatus.MUTED) {
                visible = false;
            }
        }
        else {
            visible = true;
        }
        const message = await this.messageServiceSupport.addMessage(user, activeChat, text, visible);
        activeChat.dateTimeLastAction = new Date();
        await this.chatServiceSupport.updateChat(activeChat);
        const messageDto = (0, class_transformer_1.plainToClass)(message_out_dto_1.MessageOutDto, message, { excludeExtraneousValues: true });
        const sockets = await this.userSocketServiceSupport.findSockets(activeChat);
        sockets.forEach((socket) => {
            this.server.to(socket.id).emit("/message/receive", messageDto);
        });
    }
    async onReceiveMessages(page, client) {
        const userId = this.getCurrentUserId(client);
        const user = await this.usersServiceSupport.getCurrentUser(userId);
        const socket = await this.userSocketServiceSupport.findSocket(client.id);
        const activeChat = socket.activeChat;
        if (activeChat == null) {
            throw new websockets_1.WsException("Необходимо присоединиться к чату");
        }
        let userChatLink = await this.chatServiceSupport.findUserChatLink(user, activeChat, false);
        if (userChatLink == null) {
            userChatLink = new user_chat_link_entity_1.UserChatLink();
            userChatLink.chat = activeChat;
        }
        chat_service_support_1.ChatServiceSupport.verifyAction(userChatLink, chat_service_support_1.ChatAction.RECEIVE_MESSAGE);
        const messagePage = await this.getMessagePage(activeChat, page.take, page.skip);
        client.emit("/message/page-receive", messagePage);
    }
    getCurrentUserId(client) {
        const user = this.authService.decodeJwtToken(client.handshake.auth.token);
        if (!user) {
            this.disconnect(client);
        }
        return user.id;
    }
    disconnect(client) {
        throw new websockets_1.WsException("Неавтиризованный пользователь");
    }
    async getMessagePage(chat, take, skip) {
        const messages = await this.messageServiceSupport.findMessages(chat, take, skip);
        const messageDtos = messages.map((message) => {
            return (0, class_transformer_1.plainToClass)(message_out_dto_1.MessageOutDto, message, { excludeExtraneousValues: true });
        });
        return new message_page_out_dto_1.MessagePageOutDto(messageDtos, take, skip);
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)("/enter"),
    __param(0, (0, websockets_1.MessageBody)(common_1.ParseIntPipe)),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onEnterChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("/message/send"),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)("/message/page"),
    __param(0, (0, websockets_1.MessageBody)(new socket_validation_pipe_1.SocketValidationPipe())),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [page_dto_1.PageDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "onReceiveMessages", null);
ChatGateway = __decorate([
    (0, common_1.UseFilters)(new socket_exception_filter_1.SocketExceptionFilter()),
    (0, websockets_1.WebSocketGateway)({
        namespace: "/chat",
        cors: {
            origin: ["http://localhost:3000", "http://localhost:4200"],
        },
    }),
    __param(5, (0, typeorm_2.InjectRepository)(user_socket_entity_1.UserSocket)),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_support_1.UsersServiceSupport,
        user_socket_service_support_1.UserSocketServiceSupport,
        chat_service_support_1.ChatServiceSupport,
        message_service_support_1.MessageServiceSupport,
        typeorm_1.Repository])
], ChatGateway);
exports.ChatGateway = ChatGateway;
//# sourceMappingURL=chat.gateway.js.map
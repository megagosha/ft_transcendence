import { OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { OnModuleInit } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { UsersServiceSupport } from "../users/users.service-support";
import { UserSocketServiceSupport } from "./user-socket.service-support";
import { UserSocket } from "./model/user-socket.entity";
import { ChatServiceSupport } from "./chat.service-support";
import { MessageServiceSupport } from "./message.service-support";
import { Repository } from "typeorm";
import { PageDto } from "./dto/page.dto";
export declare class ChatGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly authService;
    private readonly usersServiceSupport;
    private readonly userSocketServiceSupport;
    private readonly chatServiceSupport;
    private readonly messageServiceSupport;
    private readonly socketRepository;
    server: Server;
    constructor(authService: AuthService, usersServiceSupport: UsersServiceSupport, userSocketServiceSupport: UserSocketServiceSupport, chatServiceSupport: ChatServiceSupport, messageServiceSupport: MessageServiceSupport, socketRepository: Repository<UserSocket>);
    onModuleInit(): Promise<void>;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    onEnterChat(chatId: number, client: Socket): Promise<void>;
    onSendMessage(text: string, client: Socket): Promise<void>;
    onReceiveMessages(page: PageDto, client: Socket): Promise<void>;
    private getCurrentUserId;
    private disconnect;
    private getMessagePage;
}
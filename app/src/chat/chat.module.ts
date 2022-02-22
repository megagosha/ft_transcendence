import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../users/user.module";
import { ChatService } from "./chat.service";
import { ChatController } from "./chat.controller";
import { AuthModule } from "../auth/auth.module";
import { UserChatLink } from "./model/user-chat-link.entity";
import { Message } from "./model/message.entity";
import { Chat } from "./model/chat.entity";
import { ChatServiceSupport } from "./chat.service-support";
import { ChatGateway } from "./chat.gateway";
import { UserSocketServiceSupport } from "./user-socket.service-support";
import { UserSocket } from "./model/user-socket.entity";
import { SocketValidationPipe } from "./socket.validation-pipe";
import { MessageServiceSupport } from "./message.service-support";
import { SchedulerService } from "./scheduler.service";
import { ChatChange } from "./model/chat-change.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Chat, UserChatLink, Message, UserSocket, ChatChange]),
    forwardRef(() => UserModule),
    forwardRef(() => AuthModule),
  ],
  providers: [
    ChatService,
    ChatServiceSupport,
    ChatGateway,
    UserSocketServiceSupport,
    SocketValidationPipe,
    MessageServiceSupport,
    SchedulerService,
  ],
  controllers: [ChatController],
  exports: [ChatService, ChatServiceSupport],
})
export class ChatModule {}

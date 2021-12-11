import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserChatLink } from "./user-chat-link.entity";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([UserChatLink]),
    forwardRef(() => UsersModule),
  ],
})
export class ChatModule {}

import { Chat, ChatType } from "../model/chat.entity";
import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { UserChatRole, UserChatStatus} from "../model/user-chat-link.entity";

export class ChatBriefOutDto {
  @Expose()
  @ApiProperty({ description: "Id чата", example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ name: "Название", example: "Мой первый чат" })
  name: string;

  @Expose()
  @ApiProperty({
    name: "Тип чата",
    enum: ChatType,
    example: ChatType.PRIVATE,
  })
  type: ChatType;

  @ApiProperty({
    name: "Id второго пользователя, если это DIRECT",
    enum: ChatType,
    example: ChatType.PRIVATE,
  })
  secondUserId: number;

  @ApiProperty({
    description: "Путь аватарки",
    example: "/api/chat/1/avatar",
  })
  avatar: string;

  @ApiProperty({
    description: "Статус пользователя в чате",
    example: UserChatStatus.ACTIVE,
  })
  userChatStatus: UserChatStatus;

  @ApiProperty({
    description: "Дата окончания блокирование",
    example: new Date(),
  })
  dateTimeBlockExpire: Date;

  @ApiProperty({
    description: "Роль пользователя в чате",
    example: UserChatRole.ADMIN,
  })
  userChatRole: UserChatRole;

  @ApiProperty({
    description: "Верификация",
    example: true,
  })
  verified: boolean;
}

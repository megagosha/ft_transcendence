import { Expose } from "class-transformer";
import { UserStatus } from "../../users/user.entity";
import { UserChatRole, UserChatStatus} from "../model/user-chat-link.entity";
import { ApiProperty } from "@nestjs/swagger";

export class ChatUserOutDto {
  @Expose()
  @ApiProperty({ description: "Id", example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ description: "Username", example: "username" })
  username: string;

  @Expose()
  @ApiProperty({
    description: "Электронная почта",
    example: "username@example.com",
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: "Статус пользователя в приложении",
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Expose()
  @ApiProperty({
    description: "Дата последнего логина",
    example: new Date(),
  })
  lastLoginDate: Date;

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

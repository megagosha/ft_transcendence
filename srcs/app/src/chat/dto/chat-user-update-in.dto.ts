import { ApiProperty } from "@nestjs/swagger";
import {
  IsDate,
  IsEnum,
  MinDate,
  ValidateIf,
} from "class-validator";
import { UserChatRole, UserChatStatus } from "../model/user-chat-link.entity";

export class ChatUserUpdateInDto {
  @ApiProperty({
    description: "Роль пользователя в чате",
    example: UserChatRole.ADMIN,
    required: true,
  })
  @IsEnum(UserChatRole, {
    message: "Необходимо указать роль пользователя в чате",
  })
  readonly role: UserChatRole;

  @ApiProperty({
    description: "Статус пользователя в чате",
    example: UserChatStatus.MUTED,
    required: true,
  })
  @IsEnum(UserChatStatus, {
    message: "Необходимо указать статус пользователя в чате",
  })
  readonly status: UserChatStatus;

  @ApiProperty({
    description:
      "Дата окончания блокировки. Если дата не указана пользователь блокируется бессрочно",
    example: new Date(),
    required: false,
  })
  @ValidateIf((dto) => dto.dateTimeBlockExpire != null)
  readonly dateTimeBlockExpire: Date;
}

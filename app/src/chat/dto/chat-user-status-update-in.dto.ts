import { ApiProperty } from "@nestjs/swagger";
import {IsDate, IsEnum, IsNotEmpty, MinDate, ValidateIf} from "class-validator";
import { UserChatStatus } from "../model/user-chat-link.entity";

export class ChatUserStatusUpdateInDto {
  @ApiProperty({
    description: "Статус пользователя в чате",
    example: UserChatStatus.MUTED,
    required: true,
  })
  @IsEnum(UserChatStatus, { message: "Необходимо указать статус пользователя в чате" })
  readonly status: UserChatStatus;

  @ApiProperty({
    description: "Дата окончания блокировки. Если дата не указана пользователь блокируется бессрочно",
    example: new Date(),
    required: false,
  })
  @ValidateIf((dto) => dto.dateTimeBlockExpire != null)
  @IsDate({ message: "Некорректный формат времени" })
  @MinDate(new Date(), { message: "Дата окончания блокировки не должна быть позже текущей" })
  readonly dateTimeBlockExpire: Date;
}

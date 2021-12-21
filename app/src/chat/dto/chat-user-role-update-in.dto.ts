import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, MinDate, ValidateIf } from "class-validator";
import { UserChatRole, UserChatStatus } from "../model/user-chat-link.entity";

export class ChatUserRoleUpdateInDto {
  @ApiProperty({
    description: "Роль пользователя в чате",
    example: UserChatRole.ADMIN,
    required: true,
  })
  @IsEnum(UserChatRole, { message: "Необходимо указать роль пользователя в чате" })
  readonly role: UserChatRole;
}

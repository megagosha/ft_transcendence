import { ApiProperty } from "@nestjs/swagger";
import {IsEnum, IsNotEmpty, MinLength, NotEquals, ValidateIf} from "class-validator";
import { ChatType } from "../model/chat.entity";

export class ChatAccessUpdateInDto {
  @ApiProperty({
    name: "Пароль",
    required: false,
    minLength: 5,
    example: "password",
  })
  @ValidateIf((dto) => dto.type == ChatType.PROTECTED)
  @MinLength(5, { message: `Пароль должно иметь длину от 5 символов` })
  readonly password: string;

  @ApiProperty({
    name: "Сброс пароля для участников",
    required: false,
    example: true,
  })
  @ValidateIf((dto) => dto.type == ChatType.PROTECTED)
  readonly dropVerification: boolean;

  @ApiProperty({
    name: "Тип чата",
    required: true,
    enum: ChatType,
    example: ChatType.PUBLIC,
  })
  @IsEnum(ChatType, { message: "Тип чата не указан" })
  @NotEquals(ChatType.DIRECT, { message: "Нельзя создать личный чат" })
  readonly type: ChatType;
}

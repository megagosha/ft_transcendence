import {
  IsEnum,
  IsNotEmpty,
  Length,
  MinLength,
  NotEquals,
  ValidateIf,
} from "class-validator";
import { Chat, ChatType } from "../model/chat.entity";
import { ApiProperty } from "@nestjs/swagger";

export class ChatCreateInDto {
  @ApiProperty({
    name: "Тип чата",
    required: true,
    enum: ChatType,
    example: ChatType.PRIVATE,
  })
  @IsEnum(ChatType, { message: "Тип чата не указан" })
  @NotEquals(ChatType.DIRECT, { message: "Нельзя создать личный чат" })
  readonly type: ChatType;

  @ApiProperty({
    name: "Название",
    required: true,
    minLength: 1,
    maxLength: Chat.NAME_LENGTH,
    example: "Мой первый чат",
  })
  @Length(1, Chat.NAME_LENGTH, {
    message: `Название чата должно иметь длину от 1 до ${Chat.NAME_LENGTH} символов`,
  })
  readonly name: string;

  @ApiProperty({
    name: "Описание",
    required: false,
    minLength: 1,
    maxLength: Chat.DESCRIPTION_LENGTH,
    example: "Чат о пинг-понге",
  })
  @ValidateIf((dto) => dto.description != null)
  @Length(1, Chat.DESCRIPTION_LENGTH, {
    message: `Описание чата должно иметь длину от 1 до ${Chat.DESCRIPTION_LENGTH} символов`,
  })
  readonly description: string;

  @ApiProperty({
    name: "Пароль",
    required: false,
    minLength: 5,
    example: "password",
  })
  @ValidateIf((dto) => dto.type === ChatType.PROTECTED)
  @IsNotEmpty({ message: "Пароль чата не указан" })
  @MinLength(5, { message: `Пароль должно иметь длину от 5 символов` })
  readonly password: string;
}

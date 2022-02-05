import { ApiProperty } from "@nestjs/swagger";
import { Chat } from "../model/chat.entity";
import {IsNumber, Length, MaxLength, ValidateIf} from "class-validator";

export class ChatUpdateInDto {
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
  @MaxLength(Chat.DESCRIPTION_LENGTH, {
    message: `Описание чата должно иметь длину до ${Chat.DESCRIPTION_LENGTH} символов`,
  })
  readonly description: string;

  @ApiProperty({
    name: "Аватарка. Id файла в хранилище",
    example: 1,
    required: false,
  })
  @ValidateIf((dto) => dto.avatarFileId != null)
  @IsNumber({}, { message: "Некорректный формат аватарки" })
  avatarFileId: number;
}

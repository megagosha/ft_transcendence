import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ChatType } from "../model/chat.entity";

export class ChatOutDto {
  @Expose()
  @ApiProperty({ description: "Id чата", example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ name: "Название", example: "Мой первый чат" })
  name: string;

  @Expose()
  @ApiProperty({ name: "Описание", example: "Чат для любителей ts" })
  description: string;

  @Expose()
  @ApiProperty({
    name: "Тип чата",
    enum: ChatType,
    example: ChatType.PRIVATE,
  })
  type: ChatType;

  @Expose()
  @ApiProperty({ name: "Дата создания чата", example: new Date() })
  dateTimeCreate: Date;

  @Expose()
  @ApiProperty({ name: "Дата обновления пароля чата", example: new Date() })
  dateTimePasswordChange: Date;

  @ApiProperty({
    description: "Путь аватарки",
    example: "/api/chat/1/avatar",
  })
  avatar: string;

  @ApiProperty({ name: "Количество пользователей в чате", example: 1 })
  userCount: number;
}

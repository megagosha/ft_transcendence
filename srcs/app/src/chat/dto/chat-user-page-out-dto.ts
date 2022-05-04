import { ApiProperty } from "@nestjs/swagger";
import { ChatBriefOutDto } from "./chat-brief-out.dto";
import { ChatUserOutDto } from "./chat-user-out.dto";

export class ChatUserPageOutDto {
  @ApiProperty({ description: "Список пользователей", type: [ChatBriefOutDto] })
  users: ChatUserOutDto[];

  @ApiProperty({ description: "Размер страницы", example: 5 })
  take: number;

  @ApiProperty({ description: "Номер страницы", example: 0 })
  readonly skip: number;

  constructor(users: ChatUserOutDto[], take: number, skip: number) {
    this.users = users;
    this.take = take;
    this.skip = skip;
  }
}

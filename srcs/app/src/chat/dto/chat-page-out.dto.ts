import { ChatBriefOutDto } from "./chat-brief-out.dto";
import { ApiProperty } from "@nestjs/swagger";

export class ChatPageOutDto {
  @ApiProperty({ description: "Краткая информация о чатах", type: [ChatBriefOutDto] })
  readonly chats: ChatBriefOutDto[];

  @ApiProperty({ description: "Размер страницы", example: 5 })
  readonly take: number;

  @ApiProperty({ description: "Номер страницы", example: 0 })
  readonly skip: number;

  constructor(chats: ChatBriefOutDto[], take: number, skip: number) {
    this.chats = chats;
    this.take = take;
    this.skip = skip;
  }
}

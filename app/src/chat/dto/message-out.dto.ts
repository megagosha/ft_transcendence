import { ChatUserOutDto } from "./chat-user-out.dto";
import { Expose, Type } from "class-transformer";
import { ChatBriefOutDto } from "./chat-brief-out.dto";

export class MessageOutDto {
  @Expose()
  id: number;

  @Expose()
  text: string;

  @Expose()
  dateTimeSend: Date;

  @Expose()
  dateTimeEdit: Date;

  @Expose()
  @Type(() => ChatUserOutDto)
  authorUser: ChatUserOutDto;

  @Expose()
  @Type(() => ChatBriefOutDto)
  targetChat: ChatBriefOutDto;
}

import { ChatUserOutDto } from "./chat-user-out.dto";
import { Expose, Type } from "class-transformer";

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
}

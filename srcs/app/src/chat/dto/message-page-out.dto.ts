import { MessageOutDto } from "./message-out.dto";

export class MessagePageOutDto {
  readonly messages: MessageOutDto[];
  readonly take: number;
  readonly skip: number;

  constructor(messages: MessageOutDto[], take: number, skip: number) {
    this.messages = messages;
    this.take = take;
    this.skip = skip;
  }
}

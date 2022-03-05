import { IsNotEmpty } from "class-validator";

export class MessageInDto {
  @IsNotEmpty({ message: "Не указан текст сообщения" })
  text: string;
}

import { ApiProperty } from "@nestjs/swagger";
import { ChatBriefOutDto } from "./chat-brief-out.dto";
import { UserBriefOutDto } from "./user-brief-out-dto";

export class UserBriefPageOutDto {
  @ApiProperty({ description: "Список пользователей", type: [ChatBriefOutDto] })
  users: UserBriefOutDto[];

  @ApiProperty({ description: "Размер страницы", example: 5 })
  take: number;

  @ApiProperty({ description: "Номер страницы", example: 0 })
  readonly skip: number;

  constructor(users: UserBriefOutDto[], take: number, skip: number) {
    this.users = users;
    this.take = take;
    this.skip = skip;
  }
}

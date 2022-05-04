import { ApiProperty } from "@nestjs/swagger";
import { ChangeType } from "../model/chat-change.entity";

export class ChatChangeDto {
  @ApiProperty({
    description: "Тип изменения чата",
    example: ChangeType.ADD_PARTICIPANT,
  })
  changeType: ChangeType | null;

  @ApiProperty({
    name: "Пользователь сделавший изменение",
    example: 1,
  })
  changerUserId: number;

  @ApiProperty({
    name: "Пользователь которого удалили/добавили",
    example: 1,
  })
  targetUserId: number;
}

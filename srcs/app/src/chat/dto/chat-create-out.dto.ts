import { ApiProperty } from "@nestjs/swagger";

export class ChatCreateOutDto {
  @ApiProperty({ description: "Id созданного чата" })
  readonly id: number;
  @ApiProperty({ description: "аватарка созданного чата" })
  readonly avatar: string;

  constructor(id: number, avatar: string) {
    this.id = id;
    this.avatar = avatar;
  }
}

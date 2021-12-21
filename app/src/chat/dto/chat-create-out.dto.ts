import { ApiProperty } from "@nestjs/swagger";

export class ChatCreateOutDto {
  @ApiProperty({ description: "Id созданного чата" })
  readonly id: number;

  constructor(id: number) {
    this.id = id;
  }
}

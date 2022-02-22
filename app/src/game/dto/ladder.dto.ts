import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class LadderDto {
  constructor(obj: any, ix: number) {
    this.position = ix + 1;
    this.username = obj.user_username;
    this.games_won = obj.count;
    this.avatarImgName = obj.user_avatarImgName;
  }

  @Expose()
  @ApiProperty({ description: "Позиция", example: 1 })
  position: number;

  @Expose()
  @ApiProperty({ name: "Имя игрока", example: "Петя" })
  username: string;

  @Expose()
  @ApiProperty({ name: "Количество выигранных игр", example: 10 })
  games_won: number;

  @Expose()
  @ApiProperty({
    name: "Ссылка на аватарку",
    example: "https://google.com/avatar.png",
  })
  avatarImgName: string;
}

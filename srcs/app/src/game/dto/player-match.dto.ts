import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";

export class PlayerMatchDto {
  constructor(userId: number, ballColor = "orange", paddleColor = "orange") {
    this.userId = userId;
    this.ballColor = ballColor;
    this.paddleColor = paddleColor;
  }

  @Expose()
  @ApiProperty({ description: "User id", example: 1 })
  userId: number;

  @Expose()
  @ApiProperty({ name: "Цвет ракетки", example: "red" })
  paddleColor: string;

  @Expose()
  @ApiProperty({ name: "Выбранный цвет игрока", example: "black" })
  ballColor: string;
}

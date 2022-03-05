import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsNotEmpty, IsOptional, Length, IsInt } from "class-validator";
export class GetHistoryDto {
  @Expose()
  @ApiProperty({ description: "Id пользователя", example: 1 })
  userId: number;

  @Expose()
  @ApiProperty({ name: "Сколько взять из бд за раз", example: 10 })
  take: number;

  @Expose()
  @ApiProperty({ name: "Сколько элементов пропустить", example: 20 })
  skip: number;
}

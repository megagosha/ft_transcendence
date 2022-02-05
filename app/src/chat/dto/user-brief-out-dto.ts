import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class UserBriefOutDto {
  @Expose()
  @ApiProperty({ description: "Id", example: 1 })
  id: number;

  @Expose()
  @ApiProperty({ description: "Username", example: "username" })
  username: string;

  @Expose()
  @ApiProperty({
    description: "Дата последнего логина",
    example: new Date(),
  })
  lastLoginDate: Date;
}

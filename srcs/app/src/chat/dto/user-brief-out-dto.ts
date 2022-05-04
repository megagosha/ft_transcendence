import { Expose } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import {UserStatus} from "../../users/user.entity";

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

  @Expose()
  @ApiProperty({
    description: "Статус пользоваеля",
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: "Аватар",
    example: "/files/1.png",
  })
  avatar: string;
}

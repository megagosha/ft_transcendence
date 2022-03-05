import { IsNotEmpty, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ChangeUsernameDto {
  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  username: string;
}

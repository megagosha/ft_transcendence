import { IsNotEmpty, Length, IsInt } from "class-validator";
export class UserIdDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;
}

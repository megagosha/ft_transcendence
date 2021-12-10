import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangeUsernameDto {
  @IsString()
  @IsNotEmpty()
  @Length(0, 50)
  username: string;
}

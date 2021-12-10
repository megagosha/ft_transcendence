import { IsNotEmpty, Length } from 'class-validator';

export class ChangeUsernameDto {
  @IsNotEmpty()
  @Length(0, 50)
  username: string;
}

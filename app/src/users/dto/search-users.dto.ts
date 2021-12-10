import { IsNotEmpty, Length, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchUsersDto {
  @IsNotEmpty()
  @IsString()
  @Length(0, 50)
  username: string;

  @IsInt()
  @Type(() => Number)
  skip: number;

  @IsInt()
  @Type(() => Number)
  take: number;
}

import {
  IsNotEmpty,
  Length,
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(1)
  filter_friends: number;
}

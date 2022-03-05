import {
  IsNotEmpty,
  Length,
  IsInt,
  IsString,
  IsOptional,
  IsBoolean,
  Min,
  Max,
} from "class-validator";
export class TwoAuthCodeDto {
  @IsNotEmpty()
  @IsString()
  @Length(5, 7)
  code: string;
}

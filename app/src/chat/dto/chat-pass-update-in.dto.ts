import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MinLength, ValidateIf } from "class-validator";

export class ChatPassUpdateInDto {
  @ApiProperty({
    name: "Пароль",
    required: false,
    minLength: 5,
    example: "password",
  })
  @ValidateIf((dto) => dto.password != null)
  @MinLength(5, { message: `Пароль должно иметь длину от 5 символов` })
  readonly password: string;
}

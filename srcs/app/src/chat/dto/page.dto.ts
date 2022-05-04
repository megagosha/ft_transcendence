import { IsInt } from "class-validator";

export class PageDto {
  @IsInt({ message: "Не указан размер страницы" })
  take: number;
  @IsInt({ message: "Не номер страницы" })
  skip: number;
}

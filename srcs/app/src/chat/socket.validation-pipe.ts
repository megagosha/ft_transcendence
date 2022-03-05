import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";

@Injectable()
export class SocketValidationPipe implements PipeTransform {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (this.isEmpty(value)) {
      throw new WsException(`Ошибка валидации`);
    }

    const object = plainToClass(metatype, value);
    const errors: ValidationError[] = await validate(object);

    if (errors.length > 0) {
      throw new WsException(`${this.formatErrors(errors)}`);
    }

    return value;
  }

  private isEmpty(value: any) {
    if (Object.keys(value).length < 1) {
      return true;
    }
    return false;
  }

  private formatErrors(errors: ValidationError[]): string[] {
    return errors.map((error) => {
      for (const key in error.constraints) {
        return error.constraints[key];
      }
    });
  }
}

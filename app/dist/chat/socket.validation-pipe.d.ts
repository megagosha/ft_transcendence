import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
export declare class SocketValidationPipe implements PipeTransform {
    transform(value: any, { metatype }: ArgumentMetadata): Promise<any>;
    private isEmpty;
    private formatErrors;
}

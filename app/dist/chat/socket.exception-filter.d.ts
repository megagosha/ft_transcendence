import { ArgumentsHost, ExceptionFilter, HttpException } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
export declare class SocketExceptionFilter implements ExceptionFilter {
    catch(exception: WsException | HttpException, host: ArgumentsHost): void;
    handleError(client: Socket, exception: WsException | HttpException): void;
}

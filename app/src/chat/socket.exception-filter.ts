import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Catch(WsException, HttpException)
export class SocketExceptionFilter implements ExceptionFilter {
  public catch(exception: WsException | HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(client: Socket, exception: WsException | HttpException) {
    client.emit("/error", { error: exception.message });
  }
}

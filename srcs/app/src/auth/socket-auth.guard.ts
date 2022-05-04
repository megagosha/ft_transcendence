import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
//@todo remove file

@Injectable()
export class SocketAuthGuard extends AuthGuard('socket') {
  getRequest<T = any>(context: ExecutionContext): T {
    return context.switchToWs().getClient().handshake;
  }
}

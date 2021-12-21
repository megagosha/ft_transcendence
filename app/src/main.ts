import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { rootPath, renderPath } from './constants';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    response.sendFile(`${rootPath}.404.html`);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new NotFoundExceptionFilter());
  app.enableCors({
    origin: ['http://localhost:4200', 'https://signin.intra.42.fr'],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: true,
    optionsSuccessStatus: 200,
  });
  await app.listen(3000);
}
bootstrap();

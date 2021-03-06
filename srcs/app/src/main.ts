import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { rootPath } from "./constants";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  NotFoundException,
  ValidationPipe,
} from "@nestjs/common";
import { GlobalExceptionFilter } from "./global.exception-filter";

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
    origin: ["http://localhost:8080"],
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 200,
  });

  const config = new DocumentBuilder()
      .setTitle("Transcendence project")
      .setDescription("Web project of 21 program school")
      .setVersion("1.0")
      .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/swagger-ui", app, document);

  app.useGlobalFilters(new GlobalExceptionFilter(app.get(HttpAdapterHost)));

  await app.listen(3000, "backend");
}
bootstrap();

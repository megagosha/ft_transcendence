import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FileController } from "./file.controller";
import { ChatModule } from "../chat/chat.module";
import { File } from "./model/file.entity";
import { FileService } from "./file.service";
import { FilesServiceSupport } from "./files.service-support";

@Module({
  imports: [TypeOrmModule.forFeature([File]), forwardRef(() => ChatModule)],
  providers: [FileService, FilesServiceSupport],
  controllers: [FileController],
  exports: [FilesServiceSupport],
})
export class FileModule {}

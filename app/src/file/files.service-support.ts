import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { File } from "./model/file.entity";

@Injectable()
export class FilesServiceSupport {
  constructor(
    @InjectRepository(File) private readonly fileRepository: Repository<File>
  ) {}

  async saveFile(file: File) {
    await this.fileRepository.save(file);
    Logger.log(`Created file ${file.id}`);
  }
}

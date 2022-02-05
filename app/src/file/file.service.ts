import { Injectable, NotFoundException, StreamableFile} from "@nestjs/common";
import { Chat } from "../chat/model/chat.entity";
import { join } from "path";
import { ChatServiceSupport } from "../chat/chat.service-support";
import { File } from "./model/file.entity";
import { Response } from "express";
import { createReadStream } from "fs";

@Injectable()
export class FileService {
  constructor(private readonly chatServiceSupport: ChatServiceSupport) {}

  async getChatAvatar(chatId: number, fileName: string, res: Response): Promise<StreamableFile> {
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);
    const file: File = chat.avatar != null ? chat.avatar : ChatServiceSupport.getDefaultChatAvatar();

    if (file.name != fileName) {
      throw new NotFoundException("Image not found");
    }

    res.contentType(file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename=${file.name}`);

    return new StreamableFile(
      createReadStream(join(process.cwd(), "upload", file.uuid))
    );
  }
}

import {Injectable, InternalServerErrorException, StreamableFile} from "@nestjs/common";
import { Chat } from "../chat/model/chat.entity";
import { join } from "path";
import { ChatServiceSupport } from "../chat/chat.service-support";
import { File } from "./model/file.entity";
import { Response } from "express";
import {readFile} from "fs/promises";
import { createReadStream } from "fs";

@Injectable()
export class FileService {
  constructor(private readonly chatServiceSupport: ChatServiceSupport) {}

  async getChatAvatar(chatId: number, res: Response): Promise<StreamableFile> {
    const chat: Chat = await this.chatServiceSupport.findChatById(chatId);

    let file: File;
    if (chat.avatar != null) {
      file = chat.avatar;
    } else {
      file = this.getDefaultChatAvatar();
    }

    res.contentType(file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename=${file.name}`);

    return new StreamableFile(
      createReadStream(join(process.cwd(), "upload", file.uuid))
    );
  }

  private getDefaultChatAvatar(): File {
    const file = new File();
    file.uuid = "default-chat-avatar.png";
    file.name = "default-chat-avatar.png";
    file.contentType = "image/png";
    return file;
  }
}

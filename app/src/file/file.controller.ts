import {Controller, Get, HttpStatus, Param, ParseIntPipe, Res, StreamableFile} from "@nestjs/common";
import {ApiOperation, ApiParam, ApiResponse, ApiTags} from "@nestjs/swagger";
import {FileService} from "./file.service";
import {Response} from "express";

@ApiTags("store")
@Controller("/api/file")
export class FileController {
  constructor(private readonly fileService: FileService) {
  }

  @ApiOperation({ description: "Получить аватарку чата" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiResponse({ description: "Аватарка", status: HttpStatus.OK, type: [StreamableFile] })
  @Get("/chat/:chatId/avatar")
  async getChatAvatar(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Res({passthrough: true}) res: Response
  ): Promise<StreamableFile> {
    return await this.fileService.getChatAvatar(chatId, res);
  }
}
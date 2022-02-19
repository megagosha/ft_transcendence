import {
  Body,
  Controller, Delete,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe, ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query, Res,
  UseGuards,
  Response, StreamableFile, UseInterceptors, UploadedFile
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ChatService } from "./chat.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CurrentUserId } from "../util/user.decarator";
import { ChatCreateOutDto } from "./dto/chat-create-out.dto";
import { ChatCreateInDto } from "./dto/chat-create-in.dto";
import { ChatAccessUpdateInDto } from "./dto/chat-access-update-in.dto";
import { ChatUserUpdateInDto } from "./dto/chat-user-update-in.dto";
import { ChatUserRoleUpdateInDto } from "./dto/chat-user-role-update-in.dto";
import { ChatPageOutDto } from "./dto/chat-page-out.dto";
import { ChatOutDto } from "./dto/chat-out.dto";
import { ChatUpdateInDto } from "./dto/chat-update-in.dto";
import {ChatUserOutDto} from "./dto/chat-user-out.dto";
import {UserBriefPageOutDto} from "./dto/user-brief-page-out-dto";
import {ChatUserPageOutDto} from "./dto/chat-user-page-out-dto";
import { FileInterceptor } from "@nestjs/platform-express";
import {ChatBriefOutDto} from "./dto/chat-brief-out.dto";

@ApiTags("chat")
@Controller("/api/chat")
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ description: "Создать публичный/защищенный чат" })
  @ApiBody({ description: "Данные чата", type: ChatCreateInDto })
  @ApiResponse({ description: "Id чата", status: HttpStatus.CREATED, type: ChatCreateOutDto })
  @Post()
  async createChat(
    @Body() dto: ChatCreateInDto,
    @CurrentUserId() userId: number
  ): Promise<ChatCreateOutDto> {
    return await this.chatService.createChat(dto, userId);
  }

  @ApiOperation({ description: "Получить личный чат. Создать при необходимости" })
  @ApiResponse({ description: "Личный чат", status: HttpStatus.OK, type: ChatBriefOutDto })
  @Post("direct/user/:secondUserId")
  async getOrCreateDirectChat(
    @Param("secondUserId", ParseIntPipe) secondUserId: number,
    @CurrentUserId() userId: number
  ): Promise<ChatBriefOutDto> {
    return this.chatService.getOrCreateDirectChat(userId, secondUserId);
  }

  @ApiOperation({ description: "Получить пользователей не являющихся участниками чата" })
  @ApiResponse({ description: "Страница пользователей", status: HttpStatus.OK, type: UserBriefPageOutDto })
  @Get(":chatId/not-participants")
  async findNotParticipants(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Query("name") name: string,
    @Query("take", ParseIntPipe) take: number,
    @Query("skip", ParseIntPipe) skip: number,
    @CurrentUserId() userId: number
  ): Promise<UserBriefPageOutDto> {
    return this.chatService.findNotParticipants(userId, chatId, name, take, skip);
  }

  @ApiOperation({ description: "Добавить учатсников в чат" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiQuery({ name: "userIds", description: "Id пользователей", example: [1,2,3], type: [Number], required: true })
  @Post(":chatId/participants")
  async addParticipants(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Query("userIds", new ParseArrayPipe({ items: Number, separator: "," })) userIds: number[],
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.addParticipants(userId, chatId, userIds);
  }

  @ApiOperation({ description: "Удалить участника из чата" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiQuery({ name: "userId", description: "Id пользователя", example: 1, required: true })
  @Delete(":chatId/participant/:participantId")
  async deleteParticipant(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Param("participantId", ParseIntPipe) participantId: number,
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.deleteParticipant(userId, chatId, participantId);
  }

  @ApiOperation({ description: "Обновить чат" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiBody({ description: "Обновленные данные чата", type: ChatUpdateInDto })
  @Put(":chatId")
  async updateChat(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Body() dto: ChatUpdateInDto,
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.updateChat(userId, chatId, dto);
  }

  @ApiOperation({ description: "Обновить пароль. Добавить/удалить/изменить" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiBody({ description: "Пароль чата", type: ChatAccessUpdateInDto })
  @Put(":chatId/access")
  async updateAccess(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Body() dto: ChatAccessUpdateInDto,
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.updateAccess(userId, chatId, dto);
  }

  @ApiOperation({ description: "Изменить участника чата" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiParam({ name: "participantId", description: "Id участника", example: 1, required: true })
  @ApiBody({ description: "Данные о пользователе в чате", type: ChatUserUpdateInDto })
  @Put(":chatId/participant/:participantId")
  async updateUserChat(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Param("participantId", ParseIntPipe) participantId: number,
    @Body() dto: ChatUserUpdateInDto,
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.updateUserChat(userId, chatId, participantId, dto);
  }

  @ApiOperation({ description: "Вступить в чат" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiQuery({ name: "pass", description: "Пароль чата", example: "password", required: false })
  @Post(":chatId/join")
  async joinChat(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Query("password") password: string,
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.joinChat(userId, chatId, password);
  }

  @ApiOperation({ description: "Покинуть чат" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @Post(":chatId/leave")
  async leaveChat(
    @Param("chatId", ParseIntPipe) chatId: number,
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.leaveChat(userId, chatId);
  }

  @ApiOperation({ description: "Получить чаты пользователя с пагинацией" })
  @ApiQuery({ name: "name", description: "Наименование чата", example: "Ping-Pong", required: true })
  @ApiQuery({ name: "global", description: "Поиск чатов свои/глобально", example: true, required: true })
  @ApiQuery({ name: "take", description: "Размер страницы", example: 5, required: true })
  @ApiQuery({ name: "skip", description: "Номер страницы", example: 0, required: true })
  @ApiResponse({ description: "Страница краткой информации о чатах", status: HttpStatus.OK, type: ChatPageOutDto })
  @Get("my")
  async getChats(
    @Query("name") name: string,
    @Query("global", ParseBoolPipe) global: boolean,
    @Query("take", ParseIntPipe) take: number,
    @Query("skip", ParseIntPipe) skip: number,
    @CurrentUserId() userId: number
  ): Promise<ChatPageOutDto> {
    return this.chatService.getUserChats(userId, name, global, take, skip);
  }

  @ApiOperation({ description: "Получить чат по его id" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiResponse({ description: "Подробная информация о чате", status: HttpStatus.OK, type: ChatOutDto })
  @Get(":chatId")
  async getChat(
    @Param("chatId", ParseIntPipe) chatId: number,
    @CurrentUserId() userId: number
  ): Promise<ChatOutDto> {
    return this.chatService.getChat(userId, chatId);
  }

  @ApiOperation({ description: "Получить всех пользователей чата" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiResponse({ description: "Пользователи", status: HttpStatus.OK, type: [ChatUserOutDto] })
  @Get(":chatId/participants")
  async getChatUsers(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Query("name") name: string,
    @Query("take", ParseIntPipe) take: number,
    @Query("skip", ParseIntPipe) skip: number,
    @CurrentUserId() userId: number
  ): Promise<ChatUserPageOutDto> {
    return this.chatService.getChatUsers(userId, name, chatId, take, skip);
  }

  @ApiOperation({ description: "Загрузить аватарку чата" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @Post(':chatId/avatar/upload')
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {fileSize: 10000000, files: 1}
    }),
  )
  async uploadFile(
    @Param("chatId", ParseIntPipe) chatId: number,
    @UploadedFile() avatar: Express.Multer.File,
    @CurrentUserId() userId: number
  ) {
    this.chatService.uploadAvatar(userId, chatId, avatar);
  }
}

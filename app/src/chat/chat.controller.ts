import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
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
import { ChatPassUpdateInDto } from "./dto/chat-pass-update-in.dto";
import { ChatUserStatusUpdateInDto } from "./dto/chat-user-status-update-in.dto";
import { ChatUserRoleUpdateInDto } from "./dto/chat-user-role-update-in.dto";
import { ChatPageOutDto } from "./dto/chat-page-out.dto";
import { ChatOutDto } from "./dto/chat-out.dto";
import { ChatUpdateInDto } from "./dto/chat-update-in.dto";
import {ChatUserOutDto} from "./dto/chat-user-out.dto";

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

  @ApiOperation({ description: "Создать приватный чат" })
  @ApiResponse({ description: "Id чата", status: HttpStatus.CREATED, type: ChatCreateOutDto })
  @Post("private/user/:targetUserId")
  async createPrivateChat(
    @Param(":targetUserId", ParseIntPipe) targetUserId: number,
    @CurrentUserId() userId: number
  ): Promise<ChatCreateOutDto> {
    return this.chatService.createPrivateChat(userId, targetUserId);
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
  @ApiBody({ description: "Пароль чата", type: ChatPassUpdateInDto })
  @Put(":chatId/password")
  async updatePassword(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Body() dto: ChatPassUpdateInDto,
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.updatePassword(userId, chatId, dto);
  }

  @ApiOperation({ description: "Изменить роль участника чате" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiParam({ name: "participantId", description: "Id участника", example: 1, required: true })
  @ApiBody({ description: "Роль пользователя в чате", type: ChatUserRoleUpdateInDto })
  @Put(":chatId/participant/:participantId/role")
  async updateUserChatRole(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Param("participantId", ParseIntPipe) participantId: number,
    @Body() dto: ChatUserRoleUpdateInDto,
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.updateUserChatRole(userId, chatId, participantId, dto);
  }

  @ApiOperation({ description: "Изменить статус участника чате" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiParam({ name: "participantId", description: "Id участника", example: 1, required: true })
  @ApiBody({ description: "Статус пользователя в чате", type: ChatUserStatusUpdateInDto })
  @Put(":chatId/participant/:participantId/status")
  async updateUserChatStatus(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Param("participantId", ParseIntPipe) participantId: number,
    @Body() dto: ChatUserStatusUpdateInDto,
    @CurrentUserId() userId: number
  ): Promise<void> {
    await this.chatService.updateUserChatStatus(userId, chatId, participantId, dto);
  }

  @ApiOperation({ description: "Вступить в чат" })
  @ApiParam({ name: "chatId", description: "Id чата", example: 1, required: true })
  @ApiQuery({ name: "pass", description: "Пароль чата", example: "password", required: false })
  @Post(":chatId/join")
  async joinChat(
    @Param("chatId", ParseIntPipe) chatId: number,
    @Query("pass") password: string,
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
  @ApiQuery({ name: "take", description: "Размер страницы", example: 5, required: true })
  @ApiQuery({ name: "skip", description: "Номер страницы", example: 0, required: true })
  @ApiResponse({ description: "Страница краткой информации о чатах", status: HttpStatus.OK, type: ChatPageOutDto })
  @Get("my")
  async getChats(
    @Query("take", ParseIntPipe) take: number,
    @Query("skip", ParseIntPipe) skip: number,
    @CurrentUserId() userId: number): Promise<ChatPageOutDto> {
    return this.chatService.getUserChats(userId, take, skip);
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
    @CurrentUserId() userId: number
  ): Promise<ChatUserOutDto[]> {
    return this.chatService.getChatUsers(userId, chatId);
  }
}

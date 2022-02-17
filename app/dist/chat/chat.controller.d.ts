/// <reference types="multer" />
import { ChatService } from "./chat.service";
import { ChatCreateOutDto } from "./dto/chat-create-out.dto";
import { ChatCreateInDto } from "./dto/chat-create-in.dto";
import { ChatAccessUpdateInDto } from "./dto/chat-access-update-in.dto";
import { ChatUserUpdateInDto } from "./dto/chat-user-update-in.dto";
import { ChatUserRoleUpdateInDto } from "./dto/chat-user-role-update-in.dto";
import { ChatPageOutDto } from "./dto/chat-page-out.dto";
import { ChatOutDto } from "./dto/chat-out.dto";
import { ChatUpdateInDto } from "./dto/chat-update-in.dto";
import { UserBriefPageOutDto } from "./dto/user-brief-page-out-dto";
import { ChatUserPageOutDto } from "./dto/chat-user-page-out-dto";
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    createChat(dto: ChatCreateInDto, userId: number): Promise<ChatCreateOutDto>;
    createPrivateChat(targetUserId: number, userId: number): Promise<ChatCreateOutDto>;
    findNotParticipants(chatId: number, name: string, take: number, skip: number, userId: number): Promise<UserBriefPageOutDto>;
    addParticipants(chatId: number, userIds: number[], userId: number): Promise<void>;
    deleteParticipant(chatId: number, participantId: number, userId: number): Promise<void>;
    updateChat(chatId: number, dto: ChatUpdateInDto, userId: number): Promise<void>;
    updateAccess(chatId: number, dto: ChatAccessUpdateInDto, userId: number): Promise<void>;
    updateUserChatRole(chatId: number, participantId: number, dto: ChatUserRoleUpdateInDto, userId: number): Promise<void>;
    updateUserChat(chatId: number, participantId: number, dto: ChatUserUpdateInDto, userId: number): Promise<void>;
    joinChat(chatId: number, password: string, userId: number): Promise<void>;
    leaveChat(chatId: number, userId: number): Promise<void>;
    getChats(name: string, global: boolean, take: number, skip: number, userId: number): Promise<ChatPageOutDto>;
    getChat(chatId: number, userId: number): Promise<ChatOutDto>;
    getChatUsers(chatId: number, name: string, take: number, skip: number, userId: number): Promise<ChatUserPageOutDto>;
    uploadFile(chatId: number, avatar: Express.Multer.File, userId: number): Promise<void>;
}

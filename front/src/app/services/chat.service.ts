import {Injectable, ViewContainerRef} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";

export enum ChatType {
  PROTECTED = "PROTECTED",
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  DIRECT = "DIRECT",
}

export enum UserChatRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  PARTICIPANT = "PARTICIPANT",
}

export enum UserChatStatus {
  ACTIVE = "ACTIVE",
  MUTED = "MUTED",
  BANNED = "BANNED",
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  NONACTIVE = "NONACTIVE",
}

export interface Error {
  error: string;
}

export interface ChatDetails {
  id: number;
  name: string;
  description: string;
  type: ChatType;
  dateTimeCreate: Date;
  avatar: string;
  userCount: number;
  dateTimePasswordChange: Date;
}

export interface Chat {
  id: number;
  name: string;
  type: ChatType;
  userChatStatus: UserChatStatus;
  dateTimeBlockExpire: Date;
  userChatRole: UserChatRole;
  avatar: string;
  verified: boolean;
}

export interface ChatUpdate {
  name: string;
  description: string;
  avatar: string;
}

export interface ChatPage {
  chats: Chat[];
  take: number;
  skip: number;
}

export interface MessagePage {
  messages: Message[];
  take: number;
  skip: number;
}

export interface Message {
  id: number;
  text: string;
  dateTimeSend: Date;
  dateTimeEdit: Date;
  authorUser: ChatUser;
  targetChat: Chat;
}

export interface ChatUser {
  id: number;
  username: string;
  email: string;
  avatar: string;
  status: UserStatus;
  lastLoginDate: Date;
  userChatStatus: UserChatStatus;
  dateTimeBlockExpire: Date;
  userChatRole: UserChatRole;
  verified: boolean;
}

export interface ChatUserPage {
  users: ChatUser[];
  take: number;
  skip: number;
}

export interface NotParticipant {
  id: number;
  username: string;
  avatar: string;
  lastLoginDate: Date;
}

export interface NotParticipantPage {
  users: NotParticipant [];
  take: number;
  skip: number;
}

export interface Page {
  take: number;
  skip: number;
}

export interface ChatAccess {
  password: string;
  dropVerification: boolean;
  type: ChatType;
}

export interface ChatUserUpdate {
  role: UserChatRole,
  status: UserChatStatus,
  dateTimeBlockExpire?: Date;
}

export interface ChatCreate {
  type: ChatType;
  name: string;
  description: string;
  password: string;
}

@Injectable({providedIn: 'root'})
export class ChatService {

  private currentChat: Chat | null = null;
  private currentChatView: ViewContainerRef | null = null;

  constructor(private readonly http: HttpClient,
              private readonly snackBar: MatSnackBar) {
  }

  getChat() {
    return this.currentChat;
  }

  setChat(chat: Chat | null, chatView: ViewContainerRef | null) {
    this.currentChat = chat;
    if (this.currentChat == null) {
      this.currentChatView?.clear();
      this.currentChatView = null;
    } else {
      this.currentChatView = chatView;
    }
  }

  updateChat(chatId: number, chat: ChatUpdate) {
    return this.http.put(`/api/chat/${chatId}`, chat);
  }

  updateAccess(chatId: number, access: ChatAccess) {
    return this.http.put(`/api/chat/${chatId}/access`, access);
  }

  findNotParticipants(chatId: number, name: string, skip: number, take: number) {
    return this.http.get<NotParticipantPage>(`/api/chat/${chatId}/not-participants?name=${name}&take=${take}&skip=${skip}`);
  }

  addParticipants(chatId: number, ids: number[]) {
    return this.http.post(`/api/chat/${chatId}/participants?userIds=${ids.join(',')}`, {});
  }

  findParticipants(chatId: number, name: string, skip: number, take: number) {
    return this.http.get<ChatUserPage>(`/api/chat/${chatId}/participants?name=${name}&take=${take}&skip=${skip}`);
  }

  deleteParticipant(chatId: number, userId: number) {
    return this.http.delete(`/api/chat/${chatId}/participant/${userId}`);
  }

  leaveChat(chatId: number) {
    return this.http.post(`/api/chat/${chatId}/leave`, {});
  }

  updateChatUser(chatId: number, participantId: number, chatUser: ChatUserUpdate) {
    return this.http.put(`/api/chat/${chatId}/participant/${participantId}`, chatUser);
  }

  createChat(chat: ChatCreate) {
    return this.http.post<Chat>(`/api/chat`, chat);
  }

  findChats(name: string, global: boolean, take: number, skip: number) {
    return this.http.get<ChatPage>(
      `/api/chat/my?name=${name}&global=${global}&take=${take}&skip=${skip}`
    );
  }

  findChatById(chatId: number) {
    return this.http.get<ChatDetails>(`/api/chat/${chatId}`);
  }

  getTimeBlockExpire(chat: Chat): string {
    return chat.dateTimeBlockExpire == null ? "forever" : new Date(chat.dateTimeBlockExpire).toLocaleDateString();
  }

  joinChat(chatId: number, password: string | null) {
    if (password != null) {
      return this.http.post(`/api/chat/${chatId}/join?password=${password}`, null);
    }
    return this.http.post(`/api/chat/${chatId}/join`, null);
  }

  uploadAvatar(chatId: number, avatar: File) {
    const formData = new FormData();
    formData.append('avatar', avatar);
    return this.http.post(`/api/chat/${chatId}/avatar/upload`, formData);
  }
}
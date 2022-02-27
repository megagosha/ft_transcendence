import {Injectable, ViewContainerRef} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {io, Socket} from "socket.io-client";
import {token} from "../app.module";
import {Router} from "@angular/router";
import {UserService} from "./user.service";
import {MatDialog} from "@angular/material/dialog";
import {EnterPasswordComponent} from "../chat/enter-password/enter-password.component";

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
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  NONACTIVE = "NONACTIVE",
}

export enum ActionType {
  ADD = "ADD",
  REMOVE = "REMOVE",
  REFRESH = "REFRESH",
}

export enum ChangeType {
  CREATION = "CREATION",
  ADD_PARTICIPANT = "ADD_PARTICIPANT",
  REMOVE_PARTICIPANT = "REMOVE_PARTICIPANT",
  UPDATE_NAME = "UPDATE_NAME",
  UPDATE_DESCRIPTION = "UPDATE_DESCRIPTION",
  UPDATE_AVATAR = "UPDATE_AVATAR",
  JOIN_CHAT = "JOIN_CHAT",
  LEAVE_CHAT = "LEAVE_CHAT",
  LEAVE_PRIVATE_CHAT = "LEAVE_PRIVATE_CHAT",
  UPDATE_CHAT_USER = "UPDATE_CHAT_USER",
  UPDATE_ACCESS = "UPDATE_ACCESS",
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
  user: ChatUser;
}

export interface ChatChange {
  changeType: ChangeType;
  changerUserId: number;
  targetUserId: number;
}

export interface Chat {
  id: number;
  name: string;
  type: ChatType;
  userChatStatus: UserChatStatus;
  dateTimeBlockExpire: Date | null;
  userChatRole: UserChatRole;
  avatar: string;
  verified: boolean;
  secondUserId: number | null;
  change: ChatChange | null;
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
  private currentChatDetails: ChatDetails | null = null;
  private currentChatView: ViewContainerRef | null = null;
  private chats: Chat[] = [];
  private readonly socket: Socket;

  constructor(private readonly http: HttpClient,
              private readonly snackBar: MatSnackBar,
              private readonly router: Router,
              private readonly userService: UserService,
              private readonly dialog: MatDialog) {
    this.socket = io("/chat", {transports: ['websocket'], auth: {token : token()}, reconnectionAttempts: 2});
    this.listenError();
    this.listenChatsUpdate();
  }

  getChat() {
    return this.currentChat;
  }

  setChat(chat: Chat | null, chatView: ViewContainerRef | null) {
    this.currentChat = chat;
    if (this.currentChat == null) {
      this.currentChatView?.clear();
      this.currentChatView = null;
      this.currentChatDetails = null;
    } else {
      this.currentChatView = chatView;
    }
  }

  setChats(chats: Chat[]) {
    this.chats = chats;
  }

  setChatDetails(chatDetails: ChatDetails) {
    this.currentChatDetails = chatDetails;
  }

  treatChat(chat: Chat) {
    if (chat.change != null) {
      const change: ChatChange = chat.change;
      switch (change.changeType) {
        case ChangeType.CREATION:
          this.insertChat(chat);
          break;
        case ChangeType.UPDATE_NAME:
        case ChangeType.UPDATE_DESCRIPTION:
        case ChangeType.UPDATE_AVATAR:
        case ChangeType.ADD_PARTICIPANT:
        case ChangeType.JOIN_CHAT:
          if (chat.verified) {
            this.refreshChat(chat);
            this.insertChat(chat);
          }
          break;
        case ChangeType.LEAVE_PRIVATE_CHAT:
          if (change.changerUserId == this.userService.user.id) {
            this.closeCurrentChat();
            this.removeChat(chat);
          } else if (chat.verified) {
            this.insertChat(chat);
          }
          break;
        case ChangeType.LEAVE_CHAT:
          if (change.changerUserId == this.userService.user.id) {
            this.removeChat(chat);
          } else if (chat.verified) {
            this.insertChat(chat);
          }
          break;
        case ChangeType.REMOVE_PARTICIPANT:
          if (change.targetUserId == this.userService.user.id) {
            this.closeCurrentChat();
            this.removeChat(chat);
            this.snackBar.open(`You have been removed from chat: ${chat.name}`, "", {duration: 3000});
          } else if (chat.verified) {
            this.insertChat(chat);
          }
          break;
        case ChangeType.UPDATE_CHAT_USER:
          if (change.targetUserId == this.userService.user.id && chat.id == this.currentChat?.id) {
            if (chat.userChatStatus == UserChatStatus.BANNED) {
              this.closeCurrentChat();
              this.snackBar.open(`You have been banned before: ${this.getTimeBlockExpire(chat.dateTimeBlockExpire)}`, "OK", {duration: 5000});
            } else if (chat.userChatStatus == UserChatStatus.MUTED && this.currentChat.userChatStatus != UserChatStatus.MUTED) {
              this.snackBar.open(`You have been muted before: ${this.getTimeBlockExpire(chat.dateTimeBlockExpire)}`, "OK", {duration: 5000});
            }
          }
          this.refreshChat(chat);
          break;
        case ChangeType.UPDATE_ACCESS:
          if (this.currentChat?.id == chat.id && chat.type == ChatType.PROTECTED && !chat.verified) {
            const dialogRef = this.dialog.open(EnterPasswordComponent, {width: '300px', data: {chatId: chat.id}});
            this.snackBar.open(`Password was changed or reset`, "OK", {duration: 3000});
            dialogRef.afterClosed().subscribe((success: boolean) => {
              if (success == null || !success) {
                this.closeCurrentChat();
                this.removeChat(chat);
              }
            });
          } else {
            this.refreshChat(chat);
          }
          break;
      }
    } else if (chat.verified) {
      this.insertChat(chat);
    }
  }

  getSocket() {
    return this.socket;
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

  getTimeBlockExpire(date: Date | null): string {
    return date == null ? "forever" : new Date(date).toLocaleDateString();
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

  routeToProfile(id: number) {
    if (id == this.userService.user.id) {
      this.router.navigateByUrl('/profile');
    } else {
      this.router.navigate(['/user', { id: id }]);
    }
  }

  directChat(userId: number) {
    return this.http.post<Chat>(`/api/chat/direct/user/${userId}`, null);
  }

  blockUser(userId: number, block: boolean) {
    return this.http.put(`/api/chat/user/${userId}/block`, {block: block});
  }

  removeChat(chat: Chat) {
    const chatInd: number = this.chats.findIndex(c => c.id == chat.id);
    if (chatInd >= 0) {
      this.chats.splice(chatInd, 1);
    }
  }

  closeCurrentChat() {
    this.dialog.closeAll();
    this.setChat(null, null);
  }

  private listenChatsUpdate() {
    this.socket.on('/chat/receive', (chat: Chat) => {
      this.treatChat(chat);
    });
  }

  private listenError(): void {
    this.socket.on('/error', (error: Error) => {
      this.snackBar.open(error.error, "OK", {duration: 3000});
    });
    this.socket.on("disconnect", () => {
      this.snackBar.open("Cannot connect to server", "OK", {duration: 3000});
    });
    this.socket.on("connect_error", reason => {
      this.snackBar.open("Cannot connect to server", "OK", {duration: 3000});
    });
  }

  private insertChat(chat: Chat, back = false) {
    const chatInd: number = this.chats.findIndex(c => c.id == chat.id);
    const updatedChat = chatInd >= 0 ? this.chats[chatInd] : chat;

    if (chatInd >= 0) {
      this.chats.splice(chatInd, 1);
    }
    if (back) {
      this.chats.push(updatedChat);
    } else {
      this.chats.unshift(updatedChat);
    }
  }

  private refreshChat(newChat: Chat) {
    newChat.dateTimeBlockExpire = newChat.dateTimeBlockExpire != null ? new Date(newChat.dateTimeBlockExpire) : null;
    const avatar = newChat.avatar.split("?")[0] + `?${(new Date()).getTime().toString()}`;
    const chatInd: number = this.chats.findIndex(c => c.id == newChat.id);
    if (chatInd >= 0) {
      const oldChat: Chat = this.chats[chatInd];
      oldChat.name = newChat.name;
      oldChat.type = newChat.type;
      oldChat.userChatStatus = newChat.userChatStatus;
      oldChat.userChatRole = newChat.userChatRole;
      oldChat.dateTimeBlockExpire = newChat.dateTimeBlockExpire;
      oldChat.verified = newChat.verified;
      oldChat.avatar = avatar;
    } else if (this.currentChat?.id == newChat.id) {
      this.currentChat.name = newChat.name;
      this.currentChat.type = newChat.type;
      this.currentChat.userChatStatus = newChat.userChatStatus;
      this.currentChat.userChatRole = newChat.userChatRole;
      this.currentChat.dateTimeBlockExpire = newChat.dateTimeBlockExpire;
      this.currentChat.verified = newChat.verified;
      this.currentChat.avatar = avatar;
    }

    if (this.currentChatDetails?.id == newChat.id) {
      this.currentChatDetails.type = newChat.type;
      this.currentChatDetails.name = newChat.name;
      this.currentChatDetails.avatar = avatar;
    }
  }
}
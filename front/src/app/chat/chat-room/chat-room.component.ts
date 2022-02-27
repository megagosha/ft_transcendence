import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
  Chat,
  ChatService,
  ChatType, ChatUser,
  Error,
  Message,
  MessagePage,
  Page,
  UserChatStatus
} from "../../services/chat.service";
import {Profile} from "../../login/profile.interface";
import {UserService} from "../../services/user.service";
import {ScrollService} from "../../services/scroll.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {ChatInfoComponent} from "../chat-info/chat-info.component";
import {Socket} from "socket.io-client";
import {GameService} from "../../services/game.service";

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit, AfterViewInit {

  @ViewChild("messageScroller", {read: ElementRef}) scroller!: ElementRef;

  chat: Chat;
  messages: Message[] = [];
  user: Profile = this.userService.user;
  messageText: string = '';
  scrollService: ScrollService = new ScrollService();
  socket: Socket;

  constructor(private readonly userService: UserService,
              private readonly chatService: ChatService,
              private dialog: MatDialog,
              private readonly gameService: GameService) {
    this.chat = <Chat>chatService.getChat();
    this.socket = chatService.getSocket();
  }

  ngOnInit(): void {
    if (this.chat.type == ChatType.PUBLIC || this.chat.verified) {
      this.listenChatSocket();
    }
  }

  ngAfterViewInit(): void {
  }

  listenChatSocket() {
    this.listenMessageReceive();
    this.listenMessagePageReceive();
    this.socket.emit('/enter', this.chat.id);
  }

  nextPage() {
    const nextPage: Page = {
      take: 100,
      skip: this.messages.length
    };
    this.socket.emit('/message/page', nextPage);
  }

  sendMessage() {
    if (this.messageText != '') {
      this.socket.emit('/message/send', this.messageText);
    }
    this.messageText = '';
    this.scroller.nativeElement.scrollTop = this.scroller.nativeElement.scrollTopMax;
  }

  private listenMessageReceive(): void {
    this.socket.on('/message/receive', (message: Message) => {
      const chat: Chat = message.targetChat;
      if (message && message.targetChat.id == this.chat.id && !this.messages.some(m => m.id == message.id)) {
        message.dateTimeSend = new Date(message.dateTimeSend);
        this.messages.push(message);
      }
      this.chatService.treatChat(chat);
    });
  }

  private listenMessagePageReceive(): void {
    this.socket.on('/message/page-receive', (messagePage: MessagePage) => {
      messagePage.messages.forEach(message => {
        if (message.targetChat.id == this.chat.id && !this.messages.some(m => m.id == message.id)) {
          message.dateTimeSend = new Date(message.dateTimeSend);
          this.messages.unshift(message);
        }
      });
    });
  }

  onScroll() {
  }

  openChatInfo() {
    this.dialog.open(ChatInfoComponent, {width: '400px', backdropClass: "backdrop-dialog", height: '560px', data: this.chat});
  }

  getMessageBlockHeight() {
    if (!this.chat.verified) {
      return 'calc(100% - 40px)';
    }
    return this.chat.userChatStatus == UserChatStatus.MUTED ? '100%' : 'calc(100% - 71px - 10px)';
  }

  joinInChat() {
    document.getElementById("joinInChat")?.click();
  }

  goToProfile(userId: number | null) {
    if (userId != null) {
      this.chatService.routeToProfile(userId);
    }
  }

  availableToMatch(user: ChatUser) {
    return this.user.id != user.id;
  }

  inviteToGame(authorUser: ChatUser) {
    if (this.user.id != authorUser.id) {
      this.gameService.inviteToPlay(authorUser.id);
    }
  }
}

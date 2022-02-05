import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {
  Chat,
  ChatService,
  ChatType,
  Error,
  Message,
  MessagePage,
  Page,
  UserChatStatus
} from "../../services/chat.service";
import {Profile} from "../../login/profile.interface";
import {UserService} from "../../services/user.service";
import {ScrollService} from "../../services/scroll.service";
import {ChatSocket} from "../chat-socket";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatDialog} from "@angular/material/dialog";
import {ChatInfoComponent} from "../chat-info/chat-info.component";

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

  constructor(private readonly userService: UserService,
              private readonly chatService: ChatService,
              private socket: ChatSocket,
              private snackBar: MatSnackBar,
              private dialog: MatDialog) {
    this.chat = <Chat>chatService.getChat();
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
    this.listenError();
    this.socket.emit('/enter', this.chat.id);
  }

  nextPage() {
    const nextPage: Page = {
      take: 50,
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
    this.socket.on<Message>('/message/receive').subscribe(message => {
      if (message && message.targetChat.id == this.chat.id && !this.messages.some(m => m.id == message.id)) {
        message.dateTimeSend = new Date(message.dateTimeSend);
        this.messages.push(message);
      }
    });
  }

  private listenMessagePageReceive(): void {
    this.socket.on<MessagePage>('/message/page-receive').subscribe(messagePage => {
      messagePage.messages.forEach(message => {
        if (message.targetChat.id == this.chat.id && !this.messages.some(m => m.id == message.id)) {
          message.dateTimeSend = new Date(message.dateTimeSend);
          this.messages.unshift(message);
        }
      });
    });
  }

  private listenError(): void {
    this.socket.on<Error>('/error').subscribe(error => {
      this.snackBar.open(error.error, "OK", {duration: 5000});
    });
  }

  onScroll() {
    // console.log(this.scroller.nativeElement.scrollTop);
    // console.log(this.scroller.nativeElement.scrollHeight);
    // console.log(this.scrollService.previousScrollHeightMinusTop);
    // console.log(document.body.scrollHeight,
    //   document.body.offsetHeight,
    //   document.body.clientHeight,
    //   document.documentElement.scrollHeight,
    //   document.documentElement.offsetHeight,
    //   document.documentElement.clientHeight,
    //   window.pageYOffset);
    // console.log(this.scroller.nativeElement);
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
}
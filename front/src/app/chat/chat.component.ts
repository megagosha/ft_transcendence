import {AfterViewInit, Component, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Chat, ChatService, ChatType, Message, UserChatStatus} from "../services/chat.service";
import {Profile} from "../login/profile.interface";
import {UserService} from "../services/user.service";
import {ChatRoomDirective} from "./chat-room/chat-room.directive";
import {ChatRoomComponent} from "./chat-room/chat-room.component";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.css"]
})
export class ChatComponent implements OnInit, AfterViewInit {

  // @ViewChild('messageScroller') scroller: ElementRef | any;
  @ViewChild(ChatRoomDirective, {static: true}) chatRoom!: ChatRoomDirective;

  user: Profile = this.userService.user;
  messages: Message[] = [];
  messageText: string = '';
  saveScrollPosition: number = 0;

  constructor(
    public chatService: ChatService,
    private http: HttpClient,
    private userService: UserService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    // this.listenMessageReceive();
    // this.listenMessagePageReceive();
    // this.http.get<ChatPage>("http://localhost:3000/api/chat/my?take=20&skip=0")
    //   .subscribe((success: ChatPage) => {
    //       this.typesOfChats = success.chats;
    //     }, error => {
    //       console.error(error);
    //     }, () => {
    //       console.log("Complete");
    //     });
  }

  enterChatRoom(chat: Chat) {
    console.log(chat);
    this.chatRoom.containerRef.clear();

    if (chat.type != ChatType.PUBLIC && !chat.verified) {
      this.chatService.setChat(null, null);
      this.snackBar.open(`You should join to chat`, "OK", {duration: 5000});
      return;
    }

    if (chat.userChatStatus == UserChatStatus.BANNED) {
      this.chatService.setChat(null, null);
      this.snackBar.open(`You have been banned before: ${this.chatService.getTimeBlockExpire(chat.dateTimeBlockExpire)}`, "OK", {duration: 5000});
      return;
    }

    const containerRef: ViewContainerRef = this.chatRoom.containerRef;
    this.chatService.setChat(chat, containerRef);
    containerRef.createComponent<ChatRoomComponent>(ChatRoomComponent);

    if (chat.userChatStatus == UserChatStatus.MUTED) {
      this.snackBar.open(`You have been muted before: ${this.chatService.getTimeBlockExpire(chat.dateTimeBlockExpire)}`, "OK", {duration: 5000});
    }
  }

  // sendMessage() {
  //   if (this.messageText != '') {
  //     this.socket.emit('/message/send', this.messageText);
  //   }
  //   this.messageText = '';
  // }
  //
  ngAfterViewInit() {
    // this.scrollTreat.init(this.scroller.nativeElement);
  }

  // nextPage() {
  //   const nextPage: Page = {
  //     take: 20,
  //     skip: this.messages.length
  //   };
  //   this.socket.emit('/message/page', nextPage);
  // }

  // private listenMessageReceive(): void {
  //   this.socket.on<Message>('/message/receive').subscribe(message => {
  //     if (message && message.chatId == this.currentChat.id && !this.messages.some(m => m.id == message.id)) {
  //         this.messages.push(message);
  //       }
  //     });
  //   this.scrollTreat.restore();
  // }
  //
  // private listenMessagePageReceive(): void {
  //   this.socket.on<MessagePage>('/message/page-receive').subscribe(messagePage => {
  //     this.scrollTreat.prepareFor('up');
  //     messagePage.messages.forEach(message => {
  //       if (message.chatId == this.currentChat.id && !this.messages.some(m => m.id == message.id)) {
  //         this.messages.unshift(message);
  //       }
  //     });
  //     this.scrollTreat.restore();
  //     // this.scrollToSavePosition();
  //     // console.log(JSON.stringify(this.messages));
  //   });
  // }

  private scrollToSavePosition() {
    // this.messageScroller.scrollTo({bottom: this.saveScrollPosition - 1, behavior: "auto"});
  }
}

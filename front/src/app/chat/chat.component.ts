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
    const chat: Chat | null = this.chatService.getChat();
    if (chat != null) {
      this.enterChatRoom(chat);
    }
  }

  enterChatRoom(chat: Chat) {
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
  }

  ngAfterViewInit() {
  }
}

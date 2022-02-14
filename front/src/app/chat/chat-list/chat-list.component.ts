import {AfterViewInit, Component, EventEmitter, OnInit, Output} from '@angular/core';
import {Chat, ChatPage, ChatService, ChatType, UserChatRole, UserChatStatus} from "../../services/chat.service";
import {Profile} from "../../login/profile.interface";
import {UserService} from "../../services/user.service";
import {HttpClient} from "@angular/common/http";
import {FormControl} from "@angular/forms";
import {debounceTime, distinctUntilChanged, map} from "rxjs";
import {MatDialog} from "@angular/material/dialog";
import {ChatCreateNewComponent} from "../chat-create-new/chat-create-new.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {EnterPasswordComponent} from "../enter-password/enter-password.component";

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css']
})
export class ChatListComponent implements OnInit, AfterViewInit {

  @Output() selectedChatEvent = new EventEmitter<Chat>();
  selectedChat: Chat | null = null;

  searchName = new FormControl();
  name = '';

  chats: Chat[] = [];
  allChats: Chat[] | null = null;
  return: boolean = false;

  global: boolean = false;

  user: Profile;
  pageSize: number = 50;

  constructor(private readonly userService: UserService,
              private readonly chatService: ChatService,
              private readonly http: HttpClient,
              private readonly dialog: MatDialog,
              private readonly snackbar: MatSnackBar) {
    this.user = userService.user;
  }

  ngOnInit(): void {
    this.nextPage();
    this.searchName.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map((chatName: string) => {
        this.name = chatName;
        this.findChats()
      })
    ).subscribe();
  }

  ngAfterViewInit(): void {

  }

  findChats() {
    if (this.name != null && this.name.length > 0 || this.global) {
      if (this.allChats == null) {
        this.allChats = this.chats;
        this.return = true;
      }
      this.chats = [];
      this.nextPage();
    } else if (this.allChats != null) {
      this.chats = this.allChats;
      this.allChats = null;
      this.return = false;
    }
  }

  nextPage() {
    this.chatService.findChats(this.name, this.global, this.pageSize, this.chats.length)
      .subscribe((page: ChatPage) => {
        console.log(page);
        page.chats.forEach(chat => this.insertChat(this.chats, chat))
      }, error => {
        this.snackbar.open(error.error.message, "OK", {duration: 5000});
      }, () => {
        console.log("Complete");
      });
  }

  onSelect(chat: Chat) {
    if (this.return) {
      this.searchName.setValue("");
    }
    if (chat.verified || chat.type == ChatType.PUBLIC) {
      this.selectedChatEvent.emit(chat);
      this.selectedChat = chat;
    } else {
      this.joinInChat(chat);
    }
  }

  addChat() {
    const dialogRef = this.dialog.open(ChatCreateNewComponent, {width: '450px', height: '575px', backdropClass: "backdrop-dialog"});
    dialogRef.afterClosed().subscribe((chat: Chat) => {
      if (this.allChats != null) {
        this.allChats.unshift(chat);
      } else {
        this.chats.unshift(chat);
      }
    })
  }

  changeSearch() {
    this.global = !this.global;
    this.findChats();
  }

  getSearchColor() {
    return this.global ? "primary" : undefined;
  }

  getSearchPlaceHolder() {
    return this.global ? "Global search by name ..." : "Local search by name ...";
  }

  joinInChat(chat: Chat) {
    if (chat.type == ChatType.PROTECTED) {
      const dialogRef = this.dialog.open(EnterPasswordComponent, {width: '300px', data: {chatId: chat.id}});
      dialogRef.afterClosed().subscribe((success: boolean) => {
        if (success) {
          this.enterChat(chat)
        }
      });
    } else {
      this.chatService.joinChat(chat.id, null).subscribe(
        () => this.enterChat(chat),
        error => {
          this.snackbar.open(error.error.message, "OK", {duration: 5000});
        })
    }
  }

  getTimeBlockExpire(chat: Chat) {
    if (chat.userChatStatus == UserChatStatus.BANNED) {
      return `Status: banned before '${this.chatService.getTimeBlockExpire(chat.dateTimeBlockExpire)}'`;
    }
    return `Status: muted before '${this.chatService.getTimeBlockExpire(chat.dateTimeBlockExpire)}'`;
  }

  private enterChat(chat: Chat) {
    chat.verified = true;
    if (chat.userChatStatus == null) {
      chat.userChatStatus = UserChatStatus.ACTIVE;
      chat.userChatRole = UserChatRole.PARTICIPANT;
    }
    if (this.return && this.allChats != null) {
      this.insertChat(this.allChats, chat, false);
    } else {
      this.insertChat(this.chats, chat, false);
    }
    this.onSelect(chat);
  }

  private insertChat(chats: Chat[], chat: Chat, back = true) {
    const chatInd: number = chats.findIndex(c => c.id == chat.id);
    if (chatInd >= 0) {
      chats.splice(chatInd, 1);
    }
    if (back) {
      chats.push(chat);
    } else {
      chats.unshift(chat);
    }
  }

  getColor(chat: Chat) {
    return !(chat.id == this.selectedChat?.id || chat.userChatRole == UserChatRole.PARTICIPANT);
  }
}

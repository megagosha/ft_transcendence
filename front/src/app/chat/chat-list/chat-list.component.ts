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
  allChats: Chat[] = [];
  return: boolean = false;

  global: boolean = false;

  user: Profile;
  pageSize: number = 50;

  constructor(private readonly userService: UserService,
              private readonly chatServie: ChatService,
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
    if (this.name != null && this.name.length > 0) {
      if (this.allChats.length == 0) {
        this.allChats = this.chats;
        this.return = true;
      }
      this.chats = [];
      this.nextPage();
    } else {
      this.chats = this.allChats;
      this.allChats = [];
      this.return = false;
    }
  }

  nextPage() {
    this.chatServie.findChats(this.name, this.global, this.pageSize, this.chats.length)
      .subscribe((page: ChatPage) => {
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
    this.selectedChatEvent.emit(chat);
    this.selectedChat = chat;
  }

  addChat() {
    const dialogRef = this.dialog.open(ChatCreateNewComponent, {width: '450px', height: '575px', backdropClass: "backdrop-dialog-next"});
    dialogRef.afterClosed().subscribe((chat: Chat) => {
      if (chat != null) {
        this.chats.unshift(chat);
      }
    })
  }

  changeSearch() {
    this.global = !this.global;
    if (this.searchName.value != null && this.searchName.value.length > 0) {
      this.findChats();
    }
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
      this.chatServie.joinChat(chat.id, null).subscribe(
        () => this.enterChat(chat),
        error => {
          this.snackbar.open(error.error.message, "OK", {duration: 5000});
        })
    }
  }

  getTimeBlockExpire(chat: Chat) {
    if (chat.userChatStatus == UserChatStatus.BANNED) {
      return `Status: banned before '${this.chatServie.getTimeBlockExpire(chat)}'`;
    }
    return `Status: muted before '${this.chatServie.getTimeBlockExpire(chat)}'`;
  }

  private enterChat(chat: Chat) {
    chat.verified = true;
    if (chat.userChatStatus == null) {
      chat.userChatStatus = UserChatStatus.ACTIVE;
      chat.userChatRole = UserChatRole.PARTICIPANT;
    }
    if (this.return) {
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
}

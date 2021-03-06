import {AfterViewInit, Component, Inject, Input, OnInit} from '@angular/core';
import {
  Chat,
  ChatDetails,
  ChatService,
  ChatType,
  UserChatRole,
  UserChatStatus,
  UserStatus
} from "../../services/chat.service";
import {UserService} from "../../services/user.service";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ChatHeaderEditComponent} from "./chat-header-edit/chat-header-edit.component";
import {ChatAccessEditComponent} from "./chat-access-edit/chat-access-edit.component";
import {ChatParticipantsEditComponent} from "./chat-participants-edit/chat-participants-edit.component";
import {ChatParticipantsAddComponent} from "./chat-participants-add/chat-participants-add.component";
import {ConfirmFormComponent} from "../../confirm-form/confirm-form.component";
import {FormControl} from "@angular/forms";
import {GameService} from "../../services/game.service";

@Component({
  selector: 'app-chat-info',
  templateUrl: './chat-info.component.html',
  styleUrls: ['./chat-info.component.css']
})
export class ChatInfoComponent implements OnInit, AfterViewInit {
  @Input() chatBrief: Chat;
  chatDetails!: ChatDetails;
  avatar: FormControl;

  constructor(private readonly userService: UserService,
              private readonly http: HttpClient,
              @Inject(MAT_DIALOG_DATA) data: Chat,
              private readonly dialog: MatDialog,
              private readonly currentDialog: MatDialogRef<ChatInfoComponent>,
              private readonly chatService: ChatService,
              private readonly gameService: GameService) {
    this.chatBrief = data;
    this.avatar = new FormControl();
  }

  ngOnInit(): void {
    this.chatService.findChatById(this.chatBrief.id).subscribe(chat => {
        this.chatDetails = chat;
        this.chatDetails.dateTimePasswordChange = new Date(chat.dateTimePasswordChange);
        this.chatDetails.dateTimeCreate = new Date(chat.dateTimeCreate);
        this.chatService.setChatDetails(this.chatDetails);
      });
  }

  ngAfterViewInit() {
  }

  editHeader() {
    this.dialog.open(ChatHeaderEditComponent, {width: '400px', height: '560px', backdropClass: "backdrop-dialog-next", data: {'details': this.chatDetails, 'brief': this.chatBrief}});
  }

  editPassword() {
    this.dialog.open(ChatAccessEditComponent, {width: '400px', height: '560px', backdropClass: "backdrop-dialog-next", data: {'details': this.chatDetails, 'brief': this.chatBrief}});
  }

  editParticipants() {
    this.dialog.open(ChatParticipantsEditComponent, {width: '400px', height: '560px', backdropClass: "backdrop-dialog-next", data: {'details': this.chatDetails, 'brief': this.chatBrief}});
  }

  addParticipants() {
    this.dialog.open(ChatParticipantsAddComponent, {width: '400px', height: '560px', backdropClass: "backdrop-dialog-next", data: {'details': this.chatDetails, 'brief': this.chatBrief}});
  }

  leaveChat() {
    const dialogRef = this.dialog.open(ConfirmFormComponent, {width: '250px'});
    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.chatService.leaveChat(this.chatDetails.id)
          .subscribe(() => {
            if (this.chatBrief.type != ChatType.PUBLIC) {
              this.chatService.setChat(null, null);
            }
            this.chatBrief.verified = false;
            this.currentDialog.close();
          });
      }
    });
  }

  delegate(event: any) {
    if (this.canUpdateInfo()) {
      document.getElementById("imageInput")?.click();
    }
  }

  uploadAvatar(event: any) {
    const file: File = event.target.files[0];
    this.chatService.uploadAvatar(this.chatBrief.id, file).subscribe(() => {},
      error => {
        throw new HttpErrorResponse(error);
      }, () => {
        setTimeout(() => {
          const avatar = this.chatDetails.avatar.split("?")[0] + `?${(new Date()).getTime().toString()}`;
          this.chatDetails.avatar = avatar;
          this.chatBrief.avatar = avatar;
        }, 250)
      });
  }

  getCursor() {
    return this.canUpdateInfo() ? 'pointer' : 'auto';
  }

  canUpdateInfo() {
    return this.chatBrief.type != ChatType.DIRECT
      && this.chatBrief.userChatRole != UserChatRole.PARTICIPANT
      && this.chatBrief.verified
      && this.chatBrief.userChatStatus != UserChatStatus.BANNED;
  }

  canUpdateAccess() {
    return this.chatBrief.type != ChatType.DIRECT
      && this.chatBrief.userChatRole == UserChatRole.OWNER
      && this.chatBrief.verified;
  }

  canEditParticipants() {
    return this.canUpdateInfo();
  }

  joinInChat() {
    document.getElementById("joinInChat")?.click();
    this.currentDialog.close();
  }

  inviteToGame() {
    this.gameService.inviteToPlay(this.chatDetails.user.id);
  }

  watchGame() {
    this.gameService.watchGame(this.chatDetails.user.id);
  }

  getStatus() {
    return this.chatDetails.user.status == UserStatus.ACTIVE
      ? "PLAY"
      : this.chatDetails.user.status;
  }
}

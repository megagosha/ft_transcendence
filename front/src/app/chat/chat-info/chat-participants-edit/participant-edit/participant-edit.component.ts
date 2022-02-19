import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Chat, ChatService, ChatUser, UserChatRole, UserChatStatus, UserStatus} from "../../../../services/chat.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Profile} from "../../../../login/profile.interface";
import {UserService} from "../../../../services/user.service";

@Component({
  selector: 'app-participant-edit',
  templateUrl: './participant-edit.component.html',
  styleUrls: ['./participant-edit.component.css']
})
export class ParticipantEditComponent implements OnInit {

  participant: ChatUser;
  chat: Chat;
  role: UserChatRole;
  status: UserChatStatus;
  date: Date;
  user: Profile;

  dateExpireFilter = (d: Date | null): boolean => {
    if (d == null) {
      return true;
    }
    return d > (new Date());
  };

  constructor(@Inject(MAT_DIALOG_DATA) data: any,
              private readonly chatService: ChatService,
              private readonly userService: UserService,
              private readonly dialogRef: MatDialogRef<ParticipantEditComponent>,
              private readonly snackbar: MatSnackBar) {
    this.participant = data.participant;
    this.chat = <Chat>chatService.getChat();
    this.role = this.participant.userChatRole;
    this.status = this.participant.userChatStatus;
    this.date = this.participant.dateTimeBlockExpire;
    this.user = userService.user;
  }

  ngOnInit(): void {
  }

  disabledRole(role: any) {
    if (role == this.role) {
      return false;
    }

    if (role == UserChatRole.OWNER) {
      return true;
    }

    if (this.chat.userChatRole != UserChatRole.OWNER) {
      return true;
    }

    return this.participant.userChatRole == UserChatRole.OWNER;
  }

  onSubmit() {
    if (this.participant.userChatStatus != this.status
      || this.participant.userChatRole != this.role
      || this.participant.dateTimeBlockExpire != this.date) {
      if (this.date != null) {
        this.date.setHours(23, 59, 59);
      }
      this.chatService.updateChatUser(this.chat.id, this.participant.id, {
        role: this.role,
        status: this.status,
        dateTimeBlockExpire: this.date
      })
        .subscribe(() => {
          this.participant.userChatRole = this.role;
          this.participant.userChatStatus = this.status;
          this.participant.dateTimeBlockExpire = this.date;
          this.dialogRef.close();
        }, (error) => {
          const message: string = error.error.message.toString();
          this.snackbar.open(message, "OK", {duration: 5000});
        })
    } else {
      this.dialogRef.close();
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  disabledStatus(status: any) {
    if (status == this.status) {
      return false;
    }

    if (this.chat.userChatRole == UserChatRole.PARTICIPANT
      || this.participant.userChatRole == UserChatRole.OWNER
      || (this.participant.userChatRole == UserChatRole.ADMIN && this.chat.userChatRole != UserChatRole.OWNER)) {
      return true;
    }

    return this.participant.id == this.user.id;
  }

  getDateTimeBlockLabel() {
    if (this.participant.userChatStatus == UserChatStatus.ACTIVE || this.participant.id != this.user.id) {
      return 'Block expire date';
    }

    return this.participant.dateTimeBlockExpire != null
      ? 'Block before: ' + this.participant.dateTimeBlockExpire.toLocaleDateString()
      : 'Block before: \'forever\'';
  }
}

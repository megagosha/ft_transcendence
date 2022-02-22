import {Component, Inject, Input, OnInit} from '@angular/core';
import {Chat, ChatDetails, ChatService, ChatUser, NotParticipant, UserChatStatus} from "../../../services/chat.service";
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Profile} from "../../../login/profile.interface";
import {UserService} from "../../../services/user.service";
import {FormControl} from "@angular/forms";
import {debounceTime, distinctUntilChanged, map} from "rxjs";
import {ConfirmFormComponent} from "../../../confirm-form/confirm-form.component";
import {ParticipantEditComponent} from "./participant-edit/participant-edit.component";
import {GameService} from "../../../services/game.service";

@Component({
  selector: 'app-chat-participants-edit',
  templateUrl: './chat-participants-edit.component.html',
  styleUrls: ['./chat-participants-edit.component.css']
})
export class ChatParticipantsEditComponent implements OnInit {
  users: ChatUser [] = [];
  allUsers: ChatUser [] = [];
  return: boolean = false;
  pageSize = 50;
  currentUser: Profile;
  @Input() details: ChatDetails;
  @Input() brief: Chat;
  searchName: FormControl;

  constructor(private readonly dialogRef: MatDialogRef<ChatParticipantsEditComponent>,
              @Inject(MAT_DIALOG_DATA) data: any,
              private chatService: ChatService,
              private userService: UserService,
              private dialog: MatDialog,
              private gameService: GameService) {
    this.details = data.details;
    this.brief = data.brief;
    this.currentUser = userService.user;
    this.searchName = new FormControl('');
  }

  ngOnInit(): void {
    this.nextPage();
    this.searchName.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      map((chatName: string) => {
        this.findUsers();
      })
    ).subscribe();
  }

  private findUsers() {
    const userName: string = this.searchName.value;
    if (userName != null && userName.length > 0) {
      if (!this.return) {
        this.allUsers = this.users;
        this.return = true;
      }
      this.users = [];
      this.nextPage();
    } else if (this.return) {
      this.users = this.allUsers;
      this.allUsers = [];
      this.return = false;
    }
  }

  nextPage() {
    this.chatService.findParticipants(this.details.id, this.searchName.value, this.users.length, this.pageSize)
      .subscribe((page) => {
        page.users.forEach(user => {
          const userInd: number = this.users.findIndex(u => u.id == user.id);
          if (userInd == -1) {
            if (user.dateTimeBlockExpire != null) {
              user.dateTimeBlockExpire = new Date(user.dateTimeBlockExpire);
            }
            this.users.push(user);
          }
        })
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  onSelect(user: ChatUser) {
    this.dialog.open(ParticipantEditComponent, {width: '400px', height: '560px', backdropClass: "backdrop-dialog-next", data: {'participant': user}})
      .afterClosed().subscribe(() => {
        if (this.return) {
          this.searchName.setValue('');
        }
      });
  }

  onDelete(user: ChatUser) {
    const dialogRef = this.dialog.open(ConfirmFormComponent, {width: '250px'});
    dialogRef.afterClosed().subscribe((confirm: boolean) => {
      if (confirm) {
        this.chatService.deleteParticipant(this.details.id, user.id)
          .subscribe(() => {
            const userInd: number = this.users.findIndex(u => u.id == user.id);
            this.users.splice(userInd, 1);
            this.details.userCount -= 1;
            if (this.return) {
              this.searchName.setValue('');
            }
          });
      }
    });
  }

  availableEdit(user: ChatUser): boolean {
    if (this.currentUser.id != user.id) {
      return this.brief.userChatRole == 'OWNER' || (this.brief.userChatRole == 'ADMIN' && user.userChatRole == 'PARTICIPANT');
    }
    return false;
  }

  getTimeBlockExpire(user: ChatUser) {
    if (user.userChatStatus == UserChatStatus.BANNED) {
      return `Status: banned before '${this.chatService.getTimeBlockExpire(user.dateTimeBlockExpire)}'`;
    }
    return `Status: muted before '${this.chatService.getTimeBlockExpire(user.dateTimeBlockExpire)}'`;
  }

  goToProfile(user: ChatUser) {
    this.dialog.afterAllClosed.subscribe(() => {
      this.chatService.routeToProfile(user.id);
    })
    this.dialog.closeAll();
  }

  availableToMatch(user: ChatUser) {
    return this.currentUser.id != user.id;
  }

  inviteToPlay(user: ChatUser) {
      this.gameService.inviteToPlay(user.id);
  }
}

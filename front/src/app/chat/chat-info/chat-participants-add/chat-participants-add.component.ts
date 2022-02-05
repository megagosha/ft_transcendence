import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Chat, ChatDetails, ChatPage, ChatService, ChatUser, NotParticipant} from "../../../services/chat.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {debounceTime, distinctUntilChanged, map} from "rxjs";

@Component({
  selector: 'app-chat-participants-add',
  templateUrl: './chat-participants-add.component.html',
  styleUrls: ['./chat-participants-add.component.css']
})
export class ChatParticipantsAddComponent implements OnInit {
  searchName: FormControl;
  users: NotParticipant [] = [];
  allUsers: NotParticipant [] = [];
  selectedUserIds: Set<number> = new Set<number>();
  return: boolean = false;
  pageSize = 50;
  @Input() details: ChatDetails;
  @Input() brief: Chat;

  constructor(private readonly dialogRef: MatDialogRef<ChatParticipantsAddComponent>,
              @Inject(MAT_DIALOG_DATA) data: any,
              private chatService: ChatService,
              private snackbar: MatSnackBar) {
    this.searchName = new FormControl('');
    this.details = data.details;
    this.brief = data.brief;
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

  nextPage() {
    this.chatService.findNotParticipants(this.details.id, this.searchName.value, this.users.length, this.pageSize)
      .subscribe((page) => {
        page.users.forEach(user => {
          const userInd: number = this.users.findIndex(u => u.id == user.id);
          if (userInd == -1) {
            this.users.push(user);
          }
        })
      }, error => {
        this.snackbar.open(error.error.message, "OK", {duration: 5000});
      }, () => {
        console.log("Complete");
      });
  }

  onSelect(user: NotParticipant) {
    console.log(80);
    if (!this.selectedUserIds.has(user.id)) {
      this.selectedUserIds.add(user.id);
    } else {
      this.selectedUserIds.delete(user.id);
    }
    if (this.return) {
      this.searchName.setValue("");
    }
  }

  selected(user: NotParticipant) {
    return this.selectedUserIds.has(user.id);
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

  closeDialog() {
    this.dialogRef.close();
  }

  onSubmit() {
    if (this.selectedUserIds.size > 0) {
      const ids: number[] = []
      this.selectedUserIds.forEach(id => ids.push(id));
      this.chatService.addParticipants(this.details.id, ids)
        .subscribe(() => {
          this.details.userCount += ids.length;
          this.dialogRef.close();
        }, (error) => {
          const message: string = error.error.message.toString();
          this.snackbar.open(message, "OK", {duration: 5000});
        })
    } else {
      this.dialogRef.close();
    }
  }
}

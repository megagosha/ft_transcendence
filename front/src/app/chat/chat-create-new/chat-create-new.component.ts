import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {
  Chat,
  ChatService,
  ChatType,
  SubscriptionStatus,
  UserChatRole,
  UserChatStatus
} from "../../services/chat.service";
import {MatDialogRef} from "@angular/material/dialog";
import {MatSnackBar, MatSnackBarRef, TextOnlySnackBar} from "@angular/material/snack-bar";
import {ErrorUtil} from "../../util/ErrorUtil";
import {HttpErrorResponse, HttpStatusCode} from "@angular/common/http";

@Component({
  selector: 'app-chat-create-new',
  templateUrl: './chat-create-new.component.html',
  styleUrls: ['./chat-create-new.component.css']
})
export class ChatCreateNewComponent implements OnInit {
  name: FormControl;
  description: FormControl;
  type: ChatType;
  password: FormControl;
  hide = true;
  required: boolean;

  constructor(private readonly dialogRef: MatDialogRef<ChatCreateNewComponent>,
              private readonly chatService: ChatService,
              private readonly snackbar: MatSnackBar) {
    this.name = new FormControl('');
    this.description = new FormControl(null);
    this.type = ChatType.PUBLIC;
    this.required = true;
    this.password = new FormControl('');
  }

  ngOnInit(): void {
  }

  getPasswordError(): string {
    return this.password.getError('validation');
  }

  getNameError(): string {
    return this.name.getError('validation');
  }

  getDescriptionError(): string {
    return this.description.getError('validation');
  }

  closeDialog() {
    this.dialogRef.close(null);
  }

  onSubmit() {
    if (this.type != ChatType.PROTECTED) {
      this.password.setValue(null);
    }

    this.chatService.createChat({
      type: this.type,
      password: this.password.value == null || this.password.value.length == 0 ? null : this.password.value,
      name: this.name.value,
      description: this.description.value,
    }).subscribe((chat: Chat) => {
      this.dialogRef.close();
    }, error => {
      if (error.status == HttpStatusCode.BadRequest && error.error != null) {
        const messages: string [] = ErrorUtil.toMessages(error.error.message);

        messages.forEach(message => {
          if (message.toLowerCase().includes("пароль")) {
            this.password.setErrors({'validation': message});
          } else if (message.toLowerCase().includes("название")) {
            this.name.setErrors({'validation': message})
          } else if (message.toLowerCase().includes("описание")) {
            this.description.setErrors({'validation': message})
          } else {
            throw new HttpErrorResponse(error);
          }
        })

      } else {
        throw new HttpErrorResponse(error);
      }
    });
  }
}

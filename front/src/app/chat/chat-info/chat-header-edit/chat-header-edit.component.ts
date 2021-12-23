import {Component, Inject, Input} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Chat, ChatDetails, ChatService} from "../../../services/chat.service";
import {FormControl, Validators} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-chat-header-edit',
  templateUrl: './chat-header-edit.component.html',
  styleUrls: ['./chat-header-edit.component.css']
})
export class ChatHeaderEditComponent {

  name: FormControl;
  description: FormControl;
  @Input() details: ChatDetails;
  @Input() brief: Chat;


  constructor(private readonly dialogRef: MatDialogRef<ChatHeaderEditComponent>,
              @Inject(MAT_DIALOG_DATA) data: any,
              private chatService: ChatService,
              private snackbar: MatSnackBar) {
    this.details = data.details;
    this.brief = data.brief;
    this.name = new FormControl(this.details.name, [Validators.required]);
    this.description = new FormControl(this.details.description);
  }

  getNameError(): string {
    return this.name.getError('validation');
  }

  getDescriptionError(): string {
    return this.description.getError('validation');
  }

  onSubmit() {
    if (this.name.valid) {
      this.chatService.updateChat(this.details.id,
        {
          name: this.name.value,
          description: this.description.value,
          avatar: this.details.avatar
        })
        .subscribe(() => {
          this.details.name = this.name.value;
          this.brief.name = this.name.value;
          this.details.description = this.description.value == null || this.description.value.length == 0
            ? null
            : this.description.value;
          this.dialogRef.close();
        }, (error) => {
          const message: string = error.error.message.toString();

          if (message.toLowerCase().includes("название")) {
            this.name.setErrors({'validation': message})
          } else if (message.toLowerCase().includes("описание")) {
            this.description.setErrors({'validation': message})
          } else {
            this.snackbar.open(message, "OK", {duration: 5000});
          }
        })
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }

  getAvatarError() {

  }
}

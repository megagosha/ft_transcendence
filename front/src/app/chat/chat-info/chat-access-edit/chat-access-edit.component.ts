import {Component, Inject, Input, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Chat, ChatDetails, ChatService, ChatType} from "../../../services/chat.service";
import {FormControl} from "@angular/forms";
import {MatSnackBar} from "@angular/material/snack-bar";
import {HttpErrorResponse, HttpStatusCode} from "@angular/common/http";

@Component({
  selector: 'app-chat-password-edit',
  templateUrl: './chat-access-edit.component.html',
  styleUrls: ['./chat-access-edit.component.css']
})
export class ChatAccessEditComponent implements OnInit {

  type: ChatType;
  saveType: ChatType;
  password: FormControl;
  dropVerification = false;
  @Input() details: ChatDetails;
  @Input() brief: Chat;
  hide = true;
  required: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) data: any,
              private readonly dialogRef: MatDialogRef<ChatAccessEditComponent>,
              private readonly chatService: ChatService) {
    this.details = data.details;
    this.brief = data.brief;
    this.type = this.details.type;
    this.saveType = this.type;
    this.required = this.type != ChatType.PROTECTED;
    this.password = new FormControl('');
  }

  ngOnInit(): void {
  }

  getPasswordError(): string {
    return this.password.getError('validation');
  }

  onSubmit() {
    if (this.type == this.saveType) {
      this.closeDialog();
    }

    if (this.type != ChatType.PROTECTED) {
      this.password.setValue(null);
    }

    this.chatService.updateAccess(this.details.id,
      {
        type: this.type,
        password: this.password.value == null || this.password.value.length == 0 ? null : this.password.value,
        dropVerification: this.dropVerification
      })
      .subscribe(() => {
        this.details.type = this.type;
        this.details.dateTimePasswordChange = new Date();
        this.brief.type = this.type;
        this.dialogRef.close();
      }, (error) => {
        if (error.status == HttpStatusCode.BadRequest) {
          const message: string = error.error.message.toString();

          if (message.toLowerCase().includes("пароль")) {
            this.password.setErrors({'validation': message})
          } else {
            throw new HttpErrorResponse(error);
          }
        } else {
          throw new HttpErrorResponse(error);
        }
      })
  }

  closeDialog() {
    this.dialogRef.close();
  }
}

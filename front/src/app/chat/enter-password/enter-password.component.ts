import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ChatService} from "../../services/chat.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ErrorUtil} from "../../util/ErrorUtil";

@Component({
  selector: 'app-enter-password',
  templateUrl: './enter-password.component.html',
})
export class EnterPasswordComponent implements OnInit {

  password: FormControl;
  hide = true;
  chatId: number;

  constructor(@Inject(MAT_DIALOG_DATA) data: any,
              private readonly dialogRef: MatDialogRef<EnterPasswordComponent>,
              private readonly chatService: ChatService,
              private readonly snackbar: MatSnackBar) {
    this.chatId = data.chatId;
    this.password = new FormControl('', Validators.required);
  }

  ngOnInit(): void {
  }

  getPasswordError() {
    return this.password.getError('validation');
  }

  closeDialog() {
    this.dialogRef.close(false);
  }

  onSubmit() {
    if (this.password.valid) {
      this.chatService.joinChat(this.chatId, this.password.value).subscribe(
        () => {
          this.dialogRef.close(true);
        }, error => {
          const message: string = error.error.message.toString();

          if (message.toLowerCase().includes("пароль")) {
            this.password.setErrors({'validation': message})
          } else {
            this.snackbar.open(message, "OK", {duration: 5000});
          }
        }
      );
    } else {
      this.password.setErrors({'validation': "You must enter password"});
    }
  }
}

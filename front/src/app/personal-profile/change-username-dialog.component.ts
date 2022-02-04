import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../services/user.service";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "change-username-dialog",
  templateUrl: "change-username-dialog.html",
  styleUrls: ["personal-profile.component.css"]
})
export class ChangeUsernameDialog {
  public username = new FormControl("", [Validators.maxLength(50), Validators.required, Validators.minLength(2)]);
  private _userService;

  constructor(public dialog: MatDialog, private userService: UserService) {
    this._userService = userService;
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  onSubmit() {
    if (!this.username.valid)
      return;
    this.userService.setUserName(this.username.value).subscribe(data => {
        if (data.status != 201)
          this.username.setErrors({"conflict": "something went wrong!"})
        else {
          this.closeDialog();
          this.userService.profileUpdate();
        }
      }, error => {
        if (error instanceof HttpErrorResponse) {
          this.username.setErrors({ "conflict": "Username already taken!" });
        } else {
          console.log("Unknown error");
        }
      }
    );
  }
}

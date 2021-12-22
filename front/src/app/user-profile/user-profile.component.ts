import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Profile } from "../login/profile.interface";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth/auth.service";
import { formatDate } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { FormControl, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"]
})
export class UserProfileComponent implements OnInit {
  public profile: Profile = new Profile();
  public userService: UserService;
  private _authService: AuthService;

  constructor(private route: Router,
              userService: UserService, authService: AuthService,
              public dialog: MatDialog) {

    this.userService = userService;
    this._authService = authService;
  }

  ngOnInit(): void {
    // this.showUserProfile();
  }

  logout(): void {
    this._authService.logout();
    this.route.navigate(["login"]);
  }

  openUsernameDialog(): void {
    this.dialog.open(ChangeUsernameDialog, {
      height: "500px",
      width: "500px"
    });
  }

  openAvatarDialog(): void {
    this.dialog.open(ChangeUserAvatarDialog, {
      height: "500px",
      width: "500px"
    });
  }

  // showUserProfile() {
  //   this._loginService.getUserProfile()
  //     // clone the data object, using its known Config shape
  //     .subscribe((data: Profile) => {
  //       this.profile = { ...data }, this.formatDate(this.profile.registerDate);
  //     });
  // }

  formatDate(date: string) {
    this.profile.registerDate = formatDate(this.profile.registerDate, "shortDate", "en-US");
  }

}

@Component({
  selector: "change-useravatar-dialog",
  templateUrl: "change-useravatar-dialog.html",
  styleUrls: ["user-profile.component.css"]
})
export class ChangeUserAvatarDialog {
  public avatar = new FormControl("");
  constructor(public dialog: MatDialog, private userService: UserService) {
    this.userService = userService;
  }
}

@Component({
  selector: "change-username-dialog",
  templateUrl: "change-username-dialog.html",
  styleUrls: ["user-profile.component.css"]
})
export class ChangeUsernameDialog {
  public username = new FormControl("", [Validators.maxLength(50), Validators.required, Validators.minLength(2)]);
  result: number | undefined;
  private _userService;

  constructor(public dialog: MatDialog, private userService: UserService) {
    this._userService = userService;
  }

  closeDialog() {
    this.dialog.closeAll();
    console.log("Close dialog");
  }

  onSubmit() {
    if (!this.username.valid)
      return;
    this.userService.setUserName(this.username.value).subscribe(data => {
        this.result = data.status;
        console.log(this.result);
        if (this.result != 201)
          console.log("error");
        else {
          this.closeDialog();
          this.userService.getUserProfile();
          console.log("success");
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

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Profile } from "../login/profile.interface";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth/auth.service";
import { formatDate } from "@angular/common";
import { MatDialog } from "@angular/material/dialog";
import { FormControl, Validators } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import {  ChangeUsernameDialog } from "./change-username-dialog.component";
import { ChangeUserAvatarDialog } from "./change-useravatar-dialog.component"
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
      height: "auto",
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

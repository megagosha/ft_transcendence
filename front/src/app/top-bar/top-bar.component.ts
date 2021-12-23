import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Profile } from "../login/profile.interface";
import { UserService } from "../services/user.service";

@Component({
  selector: "app-top-bar",
  templateUrl: "./top-bar.component.html",
  styleUrls: ["./top-bar.component.css"]
})
export class TopBarComponent implements OnInit {
  // profile = "Elayne Debi";
  public userService: UserService;
  public profile: Profile | undefined;

  constructor(private router: Router, loginService: UserService) {
    this.userService = loginService;
  }

  ngOnInit(): void {
    this.profile = this.userService.user;
    // this.showUserProfile();
  }

  // showUserProfile() {
  //   this._loginService.getUserProfile()
  //     // clone the data object, using its known Config shape
  //     .subscribe((data: Profile) => this.profile = { ...data });
  // }

  openProfile() {
    this.router.navigateByUrl("/profile");
  }
}

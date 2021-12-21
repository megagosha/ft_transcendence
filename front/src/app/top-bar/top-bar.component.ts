import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Profile } from "../login/profile.interface";
import { LoginService } from "../services/login.service";

@Component({
  selector: "app-top-bar",
  templateUrl: "./top-bar.component.html",
  styleUrls: ["./top-bar.component.css"],
  providers: [LoginService]
})
export class TopBarComponent implements OnInit {
  // profile = "Elayne Debi";
  private _loginService: LoginService;
  public profile: Profile | undefined;

  constructor(private router: Router, loginService: LoginService) {
    this._loginService = loginService;
  }

  ngOnInit(): void {
    this.showUserProfile();
  }

  showUserProfile() {
    this._loginService.getUserProfile()
      // clone the data object, using its known Config shape
      .subscribe((data: Profile) => this.profile = { ...data });
  }

  openProfile() {
    this.router.navigateByUrl("/profile");
  }
}

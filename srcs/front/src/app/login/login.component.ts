import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth/auth.service";
import { stringify } from "@angular/compiler/src/util";
import { ActivatedRoute } from "@angular/router";
import { defaultLogger } from "@angular/cdk/schematics/update-tool/logger";
import { AppComponent } from "../app.component";
import { UserService } from "../services/user.service";
import { Profile } from "./profile.interface";
import { RouterModule, Router} from "@angular/router";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  private _authService: AuthService;


  constructor(authService: AuthService,
              private router: Router,
              private route: ActivatedRoute) {
    this._authService = authService;
  }

  ngOnInit(): void {
    let token = null;
    let twoAuth: boolean = false;
    this.route.queryParams
      .subscribe(params => {
          token = params["token"];
        }
      );
    if (token) {
      this._authService.setSession(token);
      this.router.navigate(['/chat']);
    }
  }



  title = "Transcendence 21 project";

  onLogin() {
    window.open("/auth/ft", "_self");
    return;
  }

  googleLogin() {
    window.open("/auth/google", "_self");
    return;
  }
}

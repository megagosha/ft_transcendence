import { Component, OnInit } from "@angular/core";
import { AuthService } from "../services/auth/auth.service";
import { stringify } from "@angular/compiler/src/util";
import { ActivatedRoute } from "@angular/router";
import { defaultLogger } from "@angular/cdk/schematics/update-tool/logger";
import { AppComponent } from "../app.component";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  private _authService: AuthService;

  constructor(authService: AuthService, private route: ActivatedRoute) {
    console.log();
    this._authService = authService;
  }

  ngOnInit(): void {
    let token = null;
    this.route.queryParams
      .subscribe(params => {
        token = params['token'];
      }
      );
    if (!token)
      console.log('Auth failed');
    else {
      this._authService.setSession(token);
      console.log('Auth success');
    }
  }

  title = "Transcendence 21 project";

  onLogin() {
    window.open("http://localhost:3000/auth/ft", "_self");
    // console.log('onLogin executed');
    // console.log(this._authService.login());
    return;
  }
}

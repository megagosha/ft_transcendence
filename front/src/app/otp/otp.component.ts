import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { Profile } from '../login/profile.interface';
import { AbstractControl, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
// import { isNumeric } from 'rxjs/util/isNumeric';


@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css']
})
export class OtpComponent implements OnInit {
  token: string = '';

  otpFormControl = new FormControl('', [Validators.required, otpCodeValidator()]);

  constructor(private authService: AuthService, private _route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    let res = this._route.queryParams
      .subscribe(params => {
          this.token = params["token"];
        }
      );
  }

  submit() {
    console.log(this.otpFormControl);
    if (!this.otpFormControl.valid)
      return;
    this.authService.continueTwoAuth(this.token, this.otpFormControl.value).subscribe(
      result => {
        console.log(result);
        if (!result.token)
          this.router.navigate(['/login/otp']);
        else {
          this.authService.setSession(result.token);
          this.router.navigate(['/chat']);
        }
      }, error => {
        this.otpFormControl.setErrors({otpError: {value: 'code declined'}});
      }
    );
  }
}
export function otpCodeValidator(): ValidatorFn {
  const isNumeric = (val: string) : boolean => {
    return !isNaN(Number(val));
  }
  return (control: AbstractControl): ValidationErrors | null  => {
    let forbidden = false;
    if (!control.value || control.value.length != 6 || !isNumeric(control.value))
      forbidden = true;
    return forbidden ? {otpCode: {value: control.value}} : null;
  };
}


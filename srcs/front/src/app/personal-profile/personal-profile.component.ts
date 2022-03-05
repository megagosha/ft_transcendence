import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { Profile } from '../login/profile.interface';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth/auth.service';
import { formatDate } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeUsernameDialog } from './change-username-dialog.component';
import { ChangeUserAvatarDialog } from './change-useravatar-dialog.component';
import { GameService } from '../services/game.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-personal-profile',
  templateUrl: './personal-profile.component.html',
  styleUrls: ['./personal-profile.component.css']
})
export class PersonalProfileComponent implements OnInit {
  public profile: Profile;

  constructor(private _router: Router, private _route: ActivatedRoute,  private sanitizer: DomSanitizer,
              public userService: UserService, private _authService: AuthService,
              public dialog: MatDialog) {
    this.profile = new Profile();
  }


  ngOnInit(): void {
    this.setPersonalProfile();
  }


  logout(): void {
    this._authService.logout();
    this._router.navigate(['login']);
  }

  openUsernameDialog(): void {
    this.dialog.open(ChangeUsernameDialog, {
      height: '500px',
      width: '500px'
    });
  }

  openAvatarDialog(): void {
    this.dialog.open(ChangeUserAvatarDialog, {
      height: 'auto',
      width: '500px'
    });
  }

  formatDate() {
    this.profile.registerDate = formatDate(this.profile.registerDate, 'shortDate', 'en-US');
  }

  private setPersonalProfile() {
    let user = this.userService.getUserAsObservable();
    user.subscribe((change: Profile) => {
      this.profile = change;
    });
  }

  enableTwoAuth() {
    if (this.profile.isTwoAuth)
    {
      this.profile.isTwoAuth = false;
      this._authService.disableTwoAuth().subscribe(res => {
        this.profile.isTwoAuth = false;
      })
      return;
    }
    this._authService.enableTwoAuth(this.userService.user.id)
      .subscribe((result) => {
          try {
            let url: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(result));
            let dialog = this.dialog.open(QrDialog, {
              height: '400px',
              width: '400px',
              data: {
                url: url
              }
            });
            dialog.afterClosed().subscribe(result => {
              this.profile.isTwoAuth = true;
            });
          } catch (err) {
            console.error('Failed to return content', err);
          }
        }
      );
  }
}

@Component({
  selector: 'qr-dialog',
  templateUrl: 'qr-dialog.html',
  styleUrls: ['qr-dialog.css']
})
export class QrDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { url: string }) {
  }
}

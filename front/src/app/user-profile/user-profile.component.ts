import { Component, OnInit } from '@angular/core';
import { Profile } from '../login/profile.interface';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../services/search-users.interface';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-personal-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  public profile: Profile;
  public userId: number;

  constructor(private _router: Router, private _route: ActivatedRoute,
              public userService: UserService, private _authService: AuthService,
              public dialog: MatDialog) {
    this.userId = 0;
    this.profile = new Profile();
  }

  ngOnInit(): void {
    this.userId = Number(this._route.snapshot.paramMap.get('id'));
    console.log(this.userId);
    this.profileUpdate();
    this._router.events.subscribe((val) => {
      if (val instanceof NavigationStart) {
        if (val.id && val.id != 0) {
          this.userId = val.id;
          this.profileUpdate();
        }
      }
    });
  }

  profileUpdate() {
    this.userService.getUserInfo(this.userId).subscribe((data: User) => {
      this.profile.id = data.id;
      this.profile.username = data.username;
      this.profile.avatarImgName = data.avatarImgName;
      this.profile.lastLoginDate = formatDate(data.lastLoginDate, 'short', 'en-US');
      this.profile.registerDate = formatDate(data.registerDate, 'shortDate', 'en-US');
      this.profile.status = data.status;
    });
  }
}

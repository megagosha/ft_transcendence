import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Profile } from '../login/profile.interface';
import { ActivatedRoute, NavigationStart, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { User } from '../services/search-users.interface';
import { formatDate } from '@angular/common';
import {GameService} from "../services/game.service";
import {Chat, ChatService} from "../services/chat.service";
import {MatSnackBar} from "@angular/material/snack-bar";

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
              public dialog: MatDialog,
              private readonly gameService: GameService,
              private readonly chatServise: ChatService,
              private readonly snackbar: MatSnackBar) {
    this.userId = 0;
    this.profile = new Profile();
  }

  ngOnInit(): void {
    this.userId = Number(this._route.snapshot.paramMap.get('id'));
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

  inviteToGame() {
    this.gameService.inviteToPlay(this.userId);
  }

  sendMessage() {
    this.chatServise.directChat(this.userId).subscribe((chat: Chat) => {
      this.chatServise.setChat(chat, null);
      },
      error => {
        this.snackbar.open(error.error.message, "OK", {duration: 5000});
      }, () => {
        this._router.navigateByUrl("/chat");
      })
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { ChangeUsernameDialog } from "../personal-profile/change-username-dialog.component";
import { FindFriendComponent } from "./find-friend/find-friend.component";
import { UserService } from "../services/user.service";
import { User } from "../services/search-users.interface";
import { empty, from, Observable, tap } from "rxjs";
import {EMPTY, of } from "rxjs";
import { SelectionModel } from "@angular/cdk/collections";
import { MatListOption } from "@angular/material/list";
import { GameService } from '../services/game.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friendlist',
  templateUrl: './friendlist.component.html',
  styleUrls: ['./friendlist.component.css']
})
export class FriendlistComponent implements OnInit {
  public userService: UserService;
  public friendList: User[];
  selectedUser: User | null = null;

  constructor(public dialog: MatDialog, public uS: UserService, protected gameService: GameService, private router: Router) {
    this.friendList = [];
    this.userService = uS;
    this.userService.getFriends().subscribe(data => {
      this.friendList = data;
    }, err => {
      this.friendList = [];
    });
  }
  ngOnInit(): void {
  }

  addFriendDialogOpener(): void {
   let dialogRef =  this.dialog.open(FindFriendComponent, {
      width: "500px",
      height: "200px"
    });
   dialogRef.afterClosed().subscribe(res => {
     if (res && res.data) this.friendList?.push(res.data);
   })
  }

  onListClick(user: User): void {
    if (user)
      this.selectedUser = user;
  }

  removeElement(key: number | undefined) {
    this.friendList.forEach((value, index) => {
      if (value.id == key) this.friendList.splice(index, 1);
    })
  }

  removeFriend() {
    if (!this.selectedUser || !this.selectedUser.id)
      return;
    this.userService.removeFriend(this.selectedUser).subscribe(res => {
      if (res) {
        this.removeElement(this.selectedUser?.id);
        this.selectedUser = null;
      }
    });
  }

  inviteToPlay(selectedUser: User | null) {
    if (!selectedUser)
      return;
    this.gameService.inviteToPlay(selectedUser.id);
  }

  watchGame(selectedUser: User | null) {
    if (!selectedUser)
      return;
    this.gameService.watchGame(selectedUser.id);
  }

  showProfile(selectedUser: User | null) {
    if (!selectedUser) return;
    this.router.navigate(['/user', { id: selectedUser.id }]);
  }
}

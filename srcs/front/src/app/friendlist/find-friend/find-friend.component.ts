import { Component, Inject, OnInit, Optional } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material/dialog";
import { UserService } from "../../services/user.service";
import { debounceTime, EMPTY, empty, finalize, map, Observable, of, startWith, switchMap, tap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { User, Users } from "../../services/search-users.interface";
import { catchError } from "rxjs/operators";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { _MatOptionBase } from "@angular/material/core";
import { Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-find-friend",
  templateUrl: "./find-friend.component.html",
  styleUrls: ["./find-friend.component.css"]
})
export class FindFriendComponent implements OnInit {
  private _userService: UserService;
  apiCtrl: Observable<User[]> | undefined;
  autoCompleteControl = new FormControl("", [Validators.required]);
  public err = false;

  constructor(public dialogRef: MatDialogRef<FindFriendComponent>,
              private userService: UserService, public dialog: MatDialog) {
    this._userService = userService;
  }

  lookup(value: string): Observable<User[]> {
    return this._userService.searchUserByUsername(value, 1).pipe(
      map(results => results),
      catchError(_ => {
        return of([]);
      })
    );
  }

  ngOnInit(): void {
    this.apiCtrl = this.autoCompleteControl.valueChanges.pipe(
      startWith(""),
      debounceTime(300),
      switchMap(value => {
        if (value != "") {
          return this.lookup(value);
        } else {
          return of([]);
        }
      })
    );
  }

  displayFn(user: User): string {
    if (user && user.username)
      return user.username;
    else
      return "";
  }

  selectOption(event: MatAutocompleteSelectedEvent) {
    if (event) {
      this._userService.addFriend(event.option.value.id).subscribe(res => {
          if (res && res.body != null) {
            // this._userService.appendFriend(res.body);
            this.dialogRef.close({data: res.body});
          }
        }, error => {
          this.autoCompleteControl.setErrors({ "add_friend": true });
        }
      );
    }
  }
}

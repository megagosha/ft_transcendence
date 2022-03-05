import { Injectable } from '@angular/core';
import { Profile } from '../login/profile.interface';
import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import {BehaviorSubject, Observable, throwError, timeout} from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { User } from './search-users.interface';
import { GameService } from './game.service';

@Injectable()
export class UserService {
  public user: Profile = new Profile();
  private _user = new BehaviorSubject(this.user);

  // public friends: Observable<User[]> | undefined;

  constructor(private http: HttpClient, private gameService: GameService) {
    this.getUserProfile().subscribe((data: Profile) => {
      this.setUser(data);
      this.user = data;
      gameService.init(this);
    });
    // this.friends = this.getFriends();
    // this.getUserProfile().subscribe((data: Profile) => this.user = { ...data });
  }

  getUserProfile() {
    return this.http.get<Profile>('/api/user/me').pipe(
      retry(3)
    );
  }

  getUserAsObservable()
  {
    return this._user.asObservable();
  }

  setUser(user: Profile) {
    this.user = user;
    this._user.next(this.user);
  }

  getUserInfo(userId: number): Observable<User> {
    return this.http.get<User>('/api/user/user', {
      params: {
        userId: userId
      }
    });
  }

  updatePicTimestamp() {
    setTimeout(() => {
      const d = new Date();
      this.user.avatarImgName += '?' + d.getTime().toString();
    }, 250);
  }

  setUserName(username: string): Observable<HttpResponse<any>> {
    return (this.http.post<HttpResponse<any>>('/api/user/set_username', { username: username }, { observe: 'response' }));
  }

  changeAvatar(avatar: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', avatar);
    return this.http.post('/api/user/set_avatar', formData, {
      reportProgress: true,
      observe: 'events'
    });
  }

  searchUserByUsername(username: string, filter: number = 0): Observable<User[]> {
    return this.http.get<User[]>('/api/user/search_friend', {
      params: {
        username: username,
        take: 10,
        skip: 0,
        filter_friends: filter
      }
    });
  }

  getFriends(): Observable<User[]> {
    return this.http.get<User[]>('/api/user/friends');
  }

  addFriend(user_id: number): Observable<HttpResponse<User>> {

    return this.http.post<User>('/api/user/add_friend', { friend_id: user_id }, { observe: 'response' });
  }

  // private handleError(error: HttpErrorResponse) {
  //   if (error.status === 0) {
  //     // A client-side or network error occurred. Handle it accordingly.
  //     console.error('An error occurred:', error.error);
  //   } else {
  //     // The backend returned an unsuccessful response code.
  //     // The response body may contain clues as to what went wrong.
  //     console.error(
  //       `Backend returned code ${error.status}, body was: `, error.error);
  //   }
  //   // Return an observable with a user-facing error message.
  //   return throwError(
  //     'Something bad happened; please try again later.');
  // }

  // appendFriend(body: User) {
  //   if (this.friends == undefined)
  //     this.friends = EMPTY;
  //   this.friends.pipe(tap(list => {
  //     list.push(body);
  //   }));
  //   console.log("New user aded " + body.username);
  // }
  removeFriend(selectedUser: User) {
    return this.http.delete<boolean>('/api/user/delete_friend', { body: { friend_id: selectedUser.id } });
  }

  profileUpdate() {
    this.getUserProfile().subscribe(data => {
      this.user = data;
    });
  }
}

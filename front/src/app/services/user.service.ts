import { Injectable } from "@angular/core";
import * as global from "../globals";
import { Profile } from "../login/profile.interface";
import { HttpClient, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { error } from "@angular/compiler/src/util";
import { FormControl } from "@angular/forms";
import { FileOrArrayFile } from "@angular-material-components/file-input";


@Injectable()
export class UserService {
  private apiUrl: string = global.apiUrl;
  public user: Profile = new Profile();

  constructor(private http: HttpClient) {
    console.log("user service constructor");
    this.getUserProfile();
    // this.getUserProfile().subscribe((data: Profile) => this.user = { ...data });
  }

  getUserProfile() {
    this.http.get<Profile>(this.apiUrl + "user/me").pipe(
      retry(3),
      catchError(this.handleError)
    ).subscribe( data => {this.user = data;});
  }

  updatePicTimestamp() {
    const d = new Date();
    this.user.avatarImgName +=  '?' + d.getTime().toString();
  }

  setUserName(username: string): Observable<HttpResponse<any>> {
    return (this.http.post<HttpResponse<any>>(this.apiUrl + "user/set_username", { username: username }, { observe: "response" }));
  }

  changeAvatar(avatar: File): Observable<any>
  {
    console.log('Avatar:');
    console.log({avatar: avatar});
    const formData = new FormData();
    formData.append('avatar', avatar);
    return this.http.post(this.apiUrl + 'user/set_avatar',  formData, {
      reportProgress: true,
      observe: "events"
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      "Something bad happened; please try again later.");
  }
}

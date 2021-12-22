import { Injectable } from "@angular/core";
import * as global from "../globals";
import { Profile } from "../login/profile.interface";
import { HttpClient, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { error } from "@angular/compiler/src/util";


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
    ).subscribe( data => {this.user = data;  console.log(this.user)});
  }

  setUserName(username: string): Observable<HttpResponse<any>> {
    return (this.http.post<HttpResponse<any>>(this.apiUrl + "user/set_username", { username: username }, { observe: "response" }));
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

import { Injectable } from '@angular/core';
import * as global from '../globals';
import { Profile } from "../login/profile.interface";
import { HttpClient, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class LoginService {
  private apiUrl: string = global.apiUrl;
  constructor(private http: HttpClient) { }

  getUserProfile()
  {
    return this.http.get<Profile>(this.apiUrl + 'user/me').pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
}

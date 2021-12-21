import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }
  login(): any
  {
    return (this.http.get('http://localhost:3000/auth/ft').subscribe());
  }

  setSession(token: string): void
  {
    localStorage.setItem('token', token);
  }

  public logout() {
    localStorage.removeItem('token');
  }
}

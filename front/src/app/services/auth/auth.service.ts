import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as global from '../../globals';
import { User } from '../search-users.interface';
import { UserService } from '../user.service';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {
  }

  login(): any {
    return (this.http.get('http://localhost:3000/auth/ft').subscribe());
  }

  setSession(token: string): void {
    localStorage.setItem('token', token);
  }

  public logout() {
    localStorage.removeItem('token');
  }

  public enableTwoAuth(userId: number) {
    return this.http.post(global.apiUrl + 'auth/2auth/generate', { userId:  userId}, {responseType: 'blob'});
  }

  continueTwoAuth(token: string, value: string) {
     return this.http.post<any>(global.apiUrl + 'auth/2auth/login', { code:  value}, {headers: {Authorization: 'Bearer ' + token}});
  }

  disableTwoAuth() {
    return this.http.get(global.apiUrl + 'auth/2auth/disable', {});
  }
}

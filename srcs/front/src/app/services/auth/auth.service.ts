import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private router: Router) {
  }

  login(): any {
    return (this.http.get('/auth/ft').subscribe());
  }

  setSession(token: string): void {
    localStorage.setItem('token', token);
  }

  public logout() {
    localStorage.removeItem('token');
  }

  public enableTwoAuth(userId: number) {
    return this.http.post('/auth/2auth/generate', { userId:  userId}, {responseType: 'blob'});
  }

  continueTwoAuth(token: string, value: string) {
     return this.http.post<any>('/auth/2auth/login', { code:  value}, {headers: {Authorization: 'Bearer ' + token}});
  }

  disableTwoAuth() {
    return this.http.get('/auth/2auth/disable', {});
  }
}

import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('token');
    if (token)
    {
      const cloned = request.clone(
        {headers: request.headers.set('Authorization', `Bearer ${token}`)})
      return next.handle(cloned);
    }
    return next.handle(request);
  }
  //   let loggetInUser = this.authService.currentUserValue;
  //   token = JSON.parse(localStorage.getItem(user.token));
  //   if (token)
  //   {
  //     request = request.clone()( {
  //       setHeaders: {
  //         Authorization: `Bearer ${token}`
  //       }
  //     });
  //   }
  //   return next.handle(request);
  // }
}

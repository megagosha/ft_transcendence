import {HttpErrorResponse, HttpStatusCode} from '@angular/common/http';
import { ErrorHandler, Injectable, NgZone } from '@angular/core';
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(
    private snackbar: MatSnackBar,
    private zone: NgZone
  ) {}

  handleError(error: any) {
    let message: string;
    if (error instanceof HttpErrorResponse) {
      if (error.status.toString().startsWith("5")) {
        message = "An server error has occurred";
      } else if (error.error != null) {
        message = error.error.message;
      } else {
        message = error.message;
      }
    } else if (error instanceof TypeError) {
      return;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = error.rejection.message;
    }

    this.zone.run(() =>
      this.snackbar.open(message || 'Undefined client error', "OK", {duration: 4000})
    );
  }
}
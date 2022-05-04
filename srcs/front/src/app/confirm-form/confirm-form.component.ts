import {Component} from '@angular/core';
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-confirm-form',
  templateUrl: './confirm-form.component.html'
})
export class ConfirmFormComponent {
  constructor(private readonly dialogRef: MatDialogRef<ConfirmFormComponent>) {
    dialogRef.disableClose = true;
  }
}

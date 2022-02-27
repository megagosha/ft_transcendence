import { Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { UserService } from "../services/user.service";
import { finalize, Subscription } from "rxjs";
import { HttpErrorResponse, HttpEventType } from "@angular/common/http";
import { FileOrArrayFile } from "@angular-material-components/file-input";
import { error } from "@angular/compiler/src/util";

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

@Component({
  selector: "change-useravatar-dialog",
  templateUrl: "change-useravatar-dialog.html",
  styleUrls: ["personal-profile.component.css"]
})
export class ChangeUserAvatarDialog {
  public avatar = new FormControl("");
  private _userService;
  uploadProgress: any;
  public file: File | undefined;
  uploadSub: Subscription | null = null;

  constructor(public dialog: MatDialog, private userService: UserService) {
    this._userService = userService;

  }

  ngOnInit() {
    this.avatar.valueChanges.subscribe((files: any) => {
      if (Array.isArray(files)) {
        this.file = files[0];
      } else
        this.file = files;
    });
  }

  closeDialog() {
    this.dialog.closeAll();
  }

  onSubmit() {
    if (!this.file) {
      return;
    } else {
      const upload = this._userService.changeAvatar(this.file)
        .pipe(
          finalize(() => this.reset())
        );

      this.uploadSub = upload.subscribe(event => {
        if (event.type == HttpEventType.UploadProgress) {
          this.uploadProgress = Math.round(100 * (event.loaded / event.total));
        }
      }, error => {
        if (error instanceof HttpErrorResponse) {
          if (error.status == 413)
            this.avatar.setErrors({ "upload_error": "File size should be < 4mb" });
          else
            this.avatar.setErrors({ "upload_error": error.message });
        }
      }, () => {
        this.closeDialog();
        this.userService.updatePicTimestamp();
      });
    }
  }

  reset() {
    this.uploadProgress = null;
    this.uploadSub = null;

  }

  cancelUpload() {

  }
}

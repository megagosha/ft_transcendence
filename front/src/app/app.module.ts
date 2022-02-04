import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { ChatComponent } from './chat/chat.component';
import { GameComponent } from './game/game.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from "@angular/material/slider";
import { RouterModule } from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthInterceptor } from "./services/auth/auth.interceptor";
import { AuthGuard } from "./services/auth/auth.guard";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from "@angular/material/divider";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  PersonalProfileComponent, QrDialog
} from './personal-profile/personal-profile.component';
import { ChangeUsernameDialog } from "./personal-profile/change-username-dialog.component";
import {ChangeUserAvatarDialog} from "./personal-profile/change-useravatar-dialog.component"
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogClose, MatDialogModule } from "@angular/material/dialog";
import { UserService } from "./services/user.service";
import { GameService } from './services/game.service';
import { NgxMatFileInputModule } from '@angular-material-components/file-input';
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { FriendlistComponent } from './friendlist/friendlist.component';
import { FindFriendComponent } from './friendlist/find-friend/find-friend.component';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatMenuModule } from "@angular/material/menu";
import { SnackbarActionsComponent } from './snackbar-actions/snackbar-actions.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { GameEndComponent } from './game-end/game-end.component';
import { GameCardComponent } from './game-card-component/game-card.component';
import { OneOnOneComponent } from './one-on-one/one-on-one.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { QrCodeModule } from 'ng-qrcode';
import { OtpComponent } from './otp/otp.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatTableModule } from '@angular/material/table';

import { LadderComponent } from './ladder/ladder.component';
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TopBarComponent,
    ChatComponent,
    GameComponent,
    PersonalProfileComponent,
    ChangeUsernameDialog,
    ChangeUserAvatarDialog,
    QrDialog,
    FriendlistComponent,
    FindFriendComponent,
    SnackbarActionsComponent,
    GameEndComponent,
    GameCardComponent,
    OneOnOneComponent,
    UserProfileComponent,
    OtpComponent,
    LadderComponent,
  ],
  imports: [
    NgxMatFileInputModule,
    MatDialogModule,
    MatSliderModule,
    MatButtonModule,
    MatToolbarModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatIconModule,
    NgOtpInputModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatGridListModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatAutocompleteModule,
    MatMenuModule,
    MatSnackBarModule,
    RouterModule,
    ScrollingModule,
    MatSlideToggleModule,
    MatTableModule
  ],

  exports: [SnackbarActionsComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor,
      multi: true},
  AuthGuard, UserService, GameService],
  bootstrap: [AppComponent]})
export class AppModule { }

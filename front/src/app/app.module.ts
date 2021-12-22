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
import { RouterModule } from "@angular/router";
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
  ChangeUserAvatarDialog,
  ChangeUsernameDialog,
  UserProfileComponent
} from "./user-profile/user-profile.component";
import { MatCardModule } from "@angular/material/card";
import { MatDialog, MatDialogClose, MatDialogModule } from "@angular/material/dialog";
import { UserService } from "./services/user.service";
import { NgxMatFileInputModule } from '@angular-material-components/file-input';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    TopBarComponent,
    ChatComponent,
    GameComponent,
    UserProfileComponent,
    ChangeUsernameDialog,
    ChangeUserAvatarDialog
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
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatGridListModule,
    MatInputModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor,
      multi: true},
  AuthGuard, UserService],
  bootstrap: [AppComponent]})
export class AppModule { }

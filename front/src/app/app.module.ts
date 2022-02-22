import {ErrorHandler, NgModule} from '@angular/core';
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
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
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
import { UserProfileComponent } from "./user-profile/user-profile.component";
import { MatCardModule } from "@angular/material/card";
import { MatDialogModule } from "@angular/material/dialog";
import { UserService } from "./services/user.service";
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { OtpComponent } from './otp/otp.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatTableModule } from '@angular/material/table';
import {ChatService} from "./services/chat.service";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {FlexLayoutModule} from "@angular/flex-layout";
import {InfiniteScrollModule} from "ngx-infinite-scroll";
import { ChatListComponent } from './chat/chat-list/chat-list.component';
import {MatChipsModule} from "@angular/material/chips";
import { ChatRoomComponent } from './chat/chat-room/chat-room.component';
import {ChatRoomDirective} from "./chat/chat-room/chat-room.directive";
import { ChatInfoComponent } from './chat/chat-info/chat-info.component';
import { ChatHeaderEditComponent } from './chat/chat-info/chat-header-edit/chat-header-edit.component';
import { ChatAccessEditComponent } from './chat/chat-info/chat-access-edit/chat-access-edit.component';
import {MatSelectModule} from "@angular/material/select";
import {MatRadioModule} from "@angular/material/radio";
import {MatCheckboxModule} from "@angular/material/checkbox";
import { ChatParticipantsEditComponent } from './chat/chat-info/chat-participants-edit/chat-participants-edit.component';
import { ChatParticipantsAddComponent } from './chat/chat-info/chat-participants-add/chat-participants-add.component';
import { ConfirmFormComponent }                                  from './confirm-form/confirm-form.component';
import { ParticipantEditComponent }                              from './chat/chat-info/chat-participants-edit/participant-edit/participant-edit.component';
import {MatDatepickerModule}                                     from "@angular/material/datepicker";
import { MAT_DATE_LOCALE, MatNativeDateModule, MatRippleModule } from "@angular/material/core";
import { ChatCreateNewComponent }                                from './chat/chat-create-new/chat-create-new.component';
import { EnterPasswordComponent }                                from './chat/enter-password/enter-password.component';
import { LadderComponent }                                       from './ladder/ladder.component';
import {ChangeUsernameDialog}                                    from "./personal-profile/change-username-dialog.component";
import {ChangeUserAvatarDialog}                                  from "./personal-profile/change-useravatar-dialog.component";
import {MatTooltipModule}                                        from "@angular/material/tooltip";
import { MatchMakingComponent }                                  from './match-making/match-making.component';
import { ColorPickerModule }                                     from "ngx-color-picker";
import { MatExpansionModule }                                    from "@angular/material/expansion";
import {GlobalErrorHandler} from "./services/global.error-handler";


export function token(): any {
  return localStorage.getItem("token");
}

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
    ChatListComponent,
    ChatRoomComponent,
    ChatRoomDirective,
    ChatInfoComponent,
    ChatHeaderEditComponent,
    ChatAccessEditComponent,
    ChatParticipantsEditComponent,
    ChatParticipantsAddComponent,
    ConfirmFormComponent,
    ParticipantEditComponent,
    ChatCreateNewComponent,
    EnterPasswordComponent,
    MatchMakingComponent,
  ],
    imports: [
        NgxMatFileInputModule,
        MatDialogModule,
        MatSliderModule,
        MatButtonModule,
        ColorPickerModule,
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
        MatTableModule,
        ScrollingModule,
        FlexLayoutModule,
        InfiniteScrollModule,
        MatChipsModule,
        MatAutocompleteModule,
        MatSnackBarModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,
        MatRippleModule,
        MatExpansionModule
    ],

  exports: [SnackbarActionsComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    { provide: MAT_DATE_LOCALE, useValue: 'ru-RU'},
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  AuthGuard,
  UserService,
  ChatService,],
  bootstrap: [AppComponent]})
export class AppModule { }

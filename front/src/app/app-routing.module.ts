import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { AppComponent }             from "./app.component";
import { GameComponent }            from "./game/game.component";
import { AuthGuard }                from "./services/auth/auth.guard";
import { ChatComponent }            from "./chat/chat.component";
import { PersonalProfileComponent } from "./personal-profile/personal-profile.component";
import { FriendlistComponent }      from "./friendlist/friendlist.component";
import { GameEndComponent }         from './game-end/game-end.component';
import { GameCardComponent }        from './game-card-component/game-card.component';
import { UserProfileComponent }     from './user-profile/user-profile.component';
import { OtpComponent }             from './otp/otp.component';
import { LadderComponent }          from './ladder/ladder.component';
import { MatchMakingComponent }     from "./match-making/match-making.component";

const routes: Routes = [
  {path: '',  component: GameComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'login/success', component: LoginComponent},
  {path: 'chat', component: ChatComponent, canActivate: [AuthGuard]},
  {path: 'profile', component: PersonalProfileComponent, canActivate: [AuthGuard]},
  {path: 'friends', component: FriendlistComponent, canActivate: [AuthGuard]},
  {path: 'game', component: GameComponent, canActivate: [AuthGuard]},
  {path: 'results', component: GameEndComponent, canActivate: [AuthGuard]},
  {path: 'testcard', component: GameCardComponent},
  {path: 'user', component: UserProfileComponent},
  {path: 'login/otp', component: OtpComponent},
  {path: 'table', component: LadderComponent},
  {path: 'match', component: MatchMakingComponent}
  //{path: '**', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

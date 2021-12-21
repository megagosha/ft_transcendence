import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from "./login/login.component";
import { AppComponent } from "./app.component";
import { GameComponent } from "./game/game.component";
import { AuthGuard } from "./services/auth/auth.guard";
import { ChatComponent } from "./chat/chat.component";
import { UserProfileComponent } from "./user-profile/user-profile.component";

const routes: Routes = [
  {path: '',  component: GameComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'login/success', component: LoginComponent},
  {path: 'chat', component: ChatComponent, canActivate: [AuthGuard]},
  {path: 'profile/:id', component: UserProfileComponent, canActivate: [AuthGuard]}
  //{path: '**', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

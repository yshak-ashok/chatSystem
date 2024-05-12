import { Routes } from '@angular/router';
import { ChatComponent } from './components/chat/chat.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SigninComponent } from './components/signin/signin.component';
import { SignupComponent } from './components/signup/signup.component';
import { OtpComponent } from './components/otp/otp.component';
import { authGuard } from './guards/auth.guard';
import { loggedInGuard } from './guards/logged-in.guard';

export const routes: Routes = [
  {path:'chat',component:ChatComponent,canActivate:[authGuard]},
  {path:'profile',component:ProfileComponent,canActivate:[authGuard]},
  {path:'signin',component:SigninComponent,canActivate:[loggedInGuard]},
  {path:'signup',component:SignupComponent,canActivate:[loggedInGuard]},
  {path:'otp/:email',component:OtpComponent,canActivate:[loggedInGuard]},
  {path:'',redirectTo:'profile',pathMatch:'full'}
];

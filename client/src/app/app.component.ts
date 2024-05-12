import { AfterViewInit, Component, DoCheck, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from './services/chat.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink,NgOptimizedImage],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private toastr: ToastrService,
    private chatService:ChatService
  ) {}
  isLoggedIn: boolean = false;
  userImage: any = '';
  image: any = this.authService.getProfilePicture();
  userId: any = this.authService.getuserId();

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe((loggedIn) => (this.isLoggedIn = loggedIn));
    this.authService.userImage$.subscribe((userImage) => (this.userImage = userImage)); 
    this.chatService.joinUser({ id: 'connectapp125' });
    if (this.userId) {
      this.authService.getUserData(this.userId._id).subscribe({
        next: (res) => {
          if (res) {
            this.userImage=this.image.profilePicture
            this.isLoggedIn = res.userData.isActive;
          }
        },
        error: (err) => {
          console.error(err);
        },
      });
    }
  }
 
  logout() {
    const userdata = this.authService.getuserId();
    console.log('userdata',userdata);
    
    this.authService.clearLocalStorage();
    this.isLoggedIn = false;
    this.authService.setLoginState(false);
    this.chatService.userStatus({ isActive: false, id: 'connectapp125',userId:userdata._id});
    this.authService.logout(userdata).subscribe((response) => {
      if (response) {
        this.toastr.info('Session Closed');
      }
    });
  }
}

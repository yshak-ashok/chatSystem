import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent implements OnInit {
  constructor(
    private FB: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private chatService: ChatService
  ) {}
  loginForm!: FormGroup;
  emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
  ngOnInit(): void {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(this.emailPattern),
      ]),
    });
  }
  loginSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.value.email as string;
      this.authService.userVerified(email).subscribe({
        next: (res) => {
          if (res) {
            console.log('res', res);
            this.authService.setToken(res);
            this.authService.setUserId(res);
            this.authService.setLoginState(true);
            this.chatService.userStatus({
              isActive: true,
              id: 'connectapp125',
              userId: res.userID._id,
            });
            if (res.userImage.profilePicture !== '') {
              this.authService.setProfilePicture(res.userImage);
              this.authService.setProfileState(res.userImage.profilePicture);
            } else {
              this.authService.setProfileState(
                './assets/user/profile_card.webp'
              );
              this.authService.setProfilePicture({
                profilePicture: './assets/user/profile_card.webp',
              });
            }
            this.router.navigate(['profile']);
            this.toastr.success('successfully logged in');
          }
        },
        error: (error) => {
          if (error.status === 401) {
            this.toastr.error('Email ID does not exist.');
          } else if (error.status === 409) {
            this.toastr.error('User already logged in.');
          } else if (error.status === 403) {
            this.toastr.warning('Account Not Verified, Please Verify Account');
            this.authService.generateOTP(email).subscribe({
              next: (res) => {
                if (res) {
                  setTimeout(() => {
                    this.router.navigate(['/otp', email]);
                  }, 2000);
                }
              },
              error: (error) => {
                console.log('error:', error);
              },
            });
          }
        },
      });
    }
  }
}

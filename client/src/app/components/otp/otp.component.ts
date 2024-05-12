import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription, map, takeWhile, timer } from 'rxjs';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './otp.component.html',
  styleUrl: './otp.component.css',
})
export class OtpComponent implements OnInit {
  OTPForm!: FormGroup;
  email: string | undefined;
  expiryTime: number = 0;
  remainingTime: any;
  timerSubscription: Subscription | undefined;

  constructor(
    private FB: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.paramMap.get('email') || '';
    console.log(this.email);
    
    this.OTPForm = this.FB.group({
      otp: ['', [Validators.required, Validators.pattern('[0-9]{4}')]],
    });
  }

  verify() {
    if (this.OTPForm.valid) {
      const inputValue = this.OTPForm.value.otp;
      this.authService.verifyOTP(inputValue, this.email).subscribe({
        next: (res) => {
          if (res) {
            this.toastr.success(
              'OTP successfully verified. Your account is now active'
            );
            this.router.navigate(['signin']);
          }
        },
        error: (error) => {
          if (error.status === 401) {
            this.toastr.error('Invalid OTP or OTP has expired.');
          } else if (error.status === 409) {
            this.toastr.warning('User already verified');
          } else {
            console.error(error);
            this.toastr.error(
              'An error occurred while verifying OTP. Please try again later.'
            );
          }
        },
      });
    }
  }

  resendOTP() {
    this.authService.generateOTP(this.email).subscribe({
      next: (res: any) => {
        if (res) {
          this.toastr.success('Resend OTP');
          this.router.navigate(['/otp', this.email]);
        }
      },
      error: (error) => {
        if (error.status === 409) {
          this.toastr.warning('User already verified');
        } else {
          this.toastr.error(
            'An error occurred while resending OTP. Please try again later.'
          );
        }
      },
    });
  }
}

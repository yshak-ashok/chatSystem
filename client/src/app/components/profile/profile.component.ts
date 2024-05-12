import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ChatService } from '../../services/chat.service';
import { NgOptimizedImage } from '@angular/common';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private imageCompress: NgxImageCompressService
  ) {}
  profilePicture: any;
  userId: any;
  userName: string = '';
  userEmail: string = '';
  ngOnInit(): void {
    this.profilePicture = this.authService.getProfilePicture();
    this.userId = this.authService.getuserId();
    if (this.profilePicture && this.profilePicture.profilePicture) {
      this.profilePicture = this.profilePicture.profilePicture;
    }
    if (this.userId && this.userId._id) {
      this.userId = this.userId._id;
    }
    this.authService.getUserData(this.userId).subscribe({
      next: (res) => {
        this.userName = res.userData.name;
        this.userEmail = res.userData.email;
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const form = new FormData();
      form.append('img', file);
      form.append('id', this.userId);
      this.authService.uploadImage(form).subscribe({
        next: (res) => {
          if (res) {
            this.profilePicture = res.profilePicture;
            this.authService.setProfilePicture(res);
            this.authService.setProfileState(this.profilePicture);
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}

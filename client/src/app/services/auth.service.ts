import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { authURL } from '../serverURL';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  generateOTP(email: string | undefined): Observable<any> {
    const data = { email: email };
    return this.http.post<string>(`${authURL}/generateOTP`, data, {
      withCredentials: true,
    });
  }
  verifyOTP(otp: number, email: string | undefined): Observable<any> {
    const data = { otp: otp, email: email };
    return this.http.post<number>(`${authURL}/verifyOTP`, data, {
      withCredentials: true,
    });
  }
  registerUser(userData: any): Observable<any> {
    return this.http.post<any>(`${authURL}/register`, userData);
  }
  userVerified(email: any): Observable<any> {
    return this.http.get<any>(`${authURL}/userVerification?email=${email}`);
  }
  setToken(data: any) {
    localStorage.setItem('Token', JSON.stringify(data.token));
  }
  setProfilePicture(data: any) {
    localStorage.setItem('Image', JSON.stringify(data));
  }
  setUserId(data: any) {
    localStorage.setItem('userId', JSON.stringify(data.userID));
  }
  getToken() {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('Token');
    } else {
      return null;
    }
  }
  getProfilePicture() {
    const localStorageData = localStorage.getItem('Image') as string;
    if (typeof localStorage !== 'undefined' && localStorageData) {
      const image = JSON.parse(localStorageData);
      return image;
    } else {
      return null;
    }
  }
  getuserId() {
    const localStorageData = localStorage.getItem('userId') as string;
    if (typeof localStorage !== 'undefined' && localStorageData) {
      const userId = JSON.parse(localStorageData);
      return userId;
    } else {
      return null;
    }
  }
  userStatus(id: any): Observable<any> {
    return this.http.get<any>(`${authURL}/userStatus?id=${id}`);
  }
  clearLocalStorage() {
    ['Token', 'userId', 'Image'].forEach((item) =>
      localStorage.removeItem(item)
    );
    this.router.navigate(['signin']);
  }
  logout(userdata: any): Observable<any> {
    return this.http.post<any>(`${authURL}/logout`, userdata);
  }
  private profileState = new BehaviorSubject<any>(
    'assets/user/profile_card.webp'
  );
  userImage$ = this.profileState.asObservable();
  setProfileState(userImage: any) {
    this.profileState.next(userImage);
  }

  private loginState = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.loginState.asObservable();
  setLoginState(loggedIn: boolean) {
    this.loginState.next(loggedIn);
  }

  uploadImage(data: FormData): Observable<any> {
    return this.http.post<any>(`${authURL}/uploadImage`, data);
  }
  getUserData(userId: any): Observable<any> {
    return this.http.get<any>(`${authURL}/userData?id=${userId}`);
  }
  getUsers(id: any): Observable<any> {
    return this.http.get<any>(`${authURL}/userList?id=${id}`);
  }
}

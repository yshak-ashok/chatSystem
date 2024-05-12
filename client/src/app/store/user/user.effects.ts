import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import {catchError, exhaustMap, map, tap } from 'rxjs/operators';
import {
  userRegistration,
  registrationSuccess,
  registrationFailure,
} from './user.actions';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { EMPTY } from 'rxjs';

@Injectable()
export class userEffect {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  registerUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(userRegistration),
      exhaustMap((action) =>
        this.authService.registerUser(action.userData).pipe(
          map(() => registrationSuccess({ email: action.userData.email })), // Dispatch action on success
          catchError((err) => {
            this.toastr.error('Registration Fail');
            return EMPTY;
          })
        )
      )
    )
  );

  registrationSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(registrationSuccess),
        exhaustMap((action) =>
          this.authService.generateOTP(action.email).pipe(
            map(() => {
              this.toastr.success('OTP successfully sent to your email');
              this.router.navigate(['/otp', action.email]);
              return { type: '[User] OTP Sent' }; // Dispatch a new action
            }),
            catchError((err) => {
              this.toastr.error('Failed to send OTP');
              return EMPTY;
            })
          )
        )
      ),
    { dispatch: true } // Dispatch the 'OTP Sent' action
  );
}

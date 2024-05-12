import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { userRegistration } from '../../store/user/user.actions';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent implements OnInit {
  constructor(
    private FB: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService,
    private store:Store
  ) {}
  registerForm!: FormGroup;
  emailPattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
  ngOnInit(): void {
    this.registerForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z ]+$'),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(this.emailPattern),
      ]),
    });
  }
  onSubmit() {
    if (this.registerForm.valid) {
      const email = this.registerForm.value.email as string;
      const name = this.registerForm.value.name as string;
      const userData = { name: name, email: email };
      this.store.dispatch(userRegistration({userData:userData}))
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '../../../node_modules/@angular/forms';
import { AuthService } from '../auth.service';
import { filter, map, tap } from '../../../node_modules/rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.loginForm.valueChanges.pipe(tap(_ => (this.loginError = ''))).subscribe();
  }

  login() {
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/todos']);
      },
      error: error => {
        this.loginError = error;
      }
    });
  }

  forgotPassword(username: string) {
    console.log(username);
  }
}

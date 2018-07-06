import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

import { environment } from '../environments/environment';

interface AuthResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login({ username, password }) {
    return this.http.post<AuthResponse>(`${environment.apiEndpoint}/auth/login`, { username, password }).pipe(
      map(response => response.accessToken),
      tap(token => this.storeToken(token)),
      map(() => this.isAuthenticated()),
      catchError(response => throwError(response.error.message))
    );
  }

  getToken() {
    return localStorage.getItem('token');
  }

  private storeToken(token: string) {
    localStorage.setItem('token', token);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

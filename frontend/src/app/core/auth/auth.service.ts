import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthResponse, RefreshRequest, SigninRequest, SignupRequest } from '../models/auth.models';
import { AuthStateService } from './auth-state.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly authState: AuthStateService
  ) {}

  signup(request: SignupRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/signup`, request)
      .pipe(tap((response) => this.authState.applySession(response)));
  }

  signin(request: SigninRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/signin`, request)
      .pipe(tap((response) => this.authState.applySession(response)));
  }

  refresh(request: RefreshRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/refresh`, request)
      .pipe(tap((response) => this.authState.applySession(response)));
  }

  logout(): Observable<void> {
    const refreshToken = this.authState.getRefreshToken();
    const payload: RefreshRequest = { refreshToken: refreshToken ?? '' };

    return this.http.post<void>(`${API_BASE_URL}/auth/logout`, payload).pipe(
      tap({
        next: () => this.authState.clearSession(),
        error: () => this.authState.clearSession()
      })
    );
  }
}

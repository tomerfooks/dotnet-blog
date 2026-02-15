import { Injectable } from '@angular/core';
import { AuthResponse } from '../models/auth.models';

const ACCESS_TOKEN_KEY = 'blog.accessToken';
const REFRESH_TOKEN_KEY = 'blog.refreshToken';
const EXPIRES_AT_KEY = 'blog.expiresAtUtc';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  saveSession(session: AuthResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
    localStorage.setItem(EXPIRES_AT_KEY, session.expiresAtUtc);
  }

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getExpiresAtUtc(): string | null {
    return localStorage.getItem(EXPIRES_AT_KEY);
  }
}

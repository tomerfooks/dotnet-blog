import { Injectable, computed, signal } from '@angular/core';
import { AuthResponse, AuthUser } from '../models/auth.models';
import { parseJwtUser } from './jwt.util';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly userSignal = signal<AuthUser | null>(null);
  private readonly accessTokenSignal = signal<string | null>(null);
  private readonly refreshTokenSignal = signal<string | null>(null);

  readonly user = computed(() => this.userSignal());
  readonly isAuthenticated = computed(() => this.userSignal() !== null && this.accessTokenSignal() !== null);
  readonly role = computed(() => this.userSignal()?.role ?? 'Guest');

  constructor(private readonly storage: TokenStorageService) {
    this.restore();
  }

  applySession(session: AuthResponse): void {
    this.storage.saveSession(session);
    this.accessTokenSignal.set(session.accessToken);
    this.refreshTokenSignal.set(session.refreshToken);
    this.userSignal.set(parseJwtUser(session.accessToken));
  }

  clearSession(): void {
    this.storage.clear();
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.userSignal.set(null);
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  getRefreshToken(): string | null {
    return this.refreshTokenSignal();
  }

  private restore(): void {
    const accessToken = this.storage.getAccessToken();
    const refreshToken = this.storage.getRefreshToken();

    if (!accessToken || !refreshToken) {
      return;
    }

    const user = parseJwtUser(accessToken);
    if (!user) {
      this.clearSession();
      return;
    }

    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
    this.userSignal.set(user);
  }
}

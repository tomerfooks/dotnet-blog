export type UserRole = 'Guest' | 'Editor' | 'Admin';

export interface SignupRequest {
  email: string;
  password: string;
  role?: 'guest' | 'editor' | 'admin';
}

export interface SigninRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAtUtc: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

import { AuthUser, UserRole } from '../models/auth.models';

interface JwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  ['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']?: string;
}

function normalizeRole(value: string | undefined): UserRole {
  switch ((value ?? '').toLowerCase()) {
    case 'admin':
      return 'Admin';
    case 'editor':
      return 'Editor';
    default:
      return 'Guest';
  }
}

export function parseJwtUser(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as JwtPayload;

    const roleClaim = payload.role ?? payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    const userId = payload.sub;
    const email = payload.email;

    if (!userId || !email) {
      return null;
    }

    return {
      id: userId,
      email,
      role: normalizeRole(roleClaim)
    };
  } catch {
    return null;
  }
}

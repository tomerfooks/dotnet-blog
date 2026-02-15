import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from './auth-state.service';
import { UserRole } from '../models/auth.models';

function includesRole(allowed: readonly UserRole[], role: UserRole): boolean {
  return allowed.some((value) => value === role);
}

export const roleGuard: CanActivateFn = (route) => {
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const allowedRoles = (route.data?.['roles'] as UserRole[] | undefined) ?? [];
  if (!allowedRoles.length) {
    return true;
  }

  if (!authState.isAuthenticated()) {
    return router.createUrlTree(['/signin']);
  }

  if (includesRole(allowedRoles, authState.role())) {
    return true;
  }

  return router.createUrlTree(['/']);
};

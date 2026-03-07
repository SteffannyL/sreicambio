// core/guards/role.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const userRole = authService.getRol();

    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Si no tiene permiso → redirigir a dashboard o login
    router.navigate(['/dashboard']);
    return false;
  };
};
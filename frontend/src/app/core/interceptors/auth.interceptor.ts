import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log('URL REQUEST:', req.url);
  console.log('TOKEN INTERCEPTOR:', token);

  // 🔥 DETECCIÓN FUERTE (NO FALLA)
  if (req.url.startsWith('http://localhost:8080/api/ia')) {
    console.log('🚫 NO TOKEN PARA IA');
    return next(req);
  }

  // ❗ login/register
  if (
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register')
  ) {
    return next(req);
  }

  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(authReq);
  }

  return next(req);
};
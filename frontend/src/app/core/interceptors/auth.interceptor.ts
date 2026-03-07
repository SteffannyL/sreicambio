import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Interceptor ejecutado para URL:', req.url);

  const authService = inject(AuthService);
  const token = authService.getToken();


  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }

  if (req.url.includes('usuarios') || req.url.includes('listar') || req.url.includes('admin')) {
    console.log('>>> Saltando chequeo de token para esta petición');
    return next(req);  // envía SIN token a propósito
  }

  if (token) {
    console.log('>>> Agregando token');
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }

    });
    return next(authReq);
  }

  console.log('>>> No hay token → se envía petición sin auth');
  return next(req);
};
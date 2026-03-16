import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest } from '../models/login-request.model';
import { LoginResponse } from '../models/login-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = environment.apiUrl + '/api/auth';

  constructor(private http: HttpClient) {}

  /* ================= LOGIN ================= */

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveSession(response);
      })
    );
  }

  /* ================= REGISTER ================= */

  register(usuario: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, usuario);
  }

  /* ================= GUARDAR SESIÓN ================= */

  private saveSession(response: LoginResponse): void {

    localStorage.setItem('token', response.token);
    localStorage.setItem('rol', response.rol.toUpperCase());
    localStorage.setItem('idusuario', response.idusuario.toString());

    // 🔴 IMPORTANTE para expulsión de sesión
    if (response.idsesion) {
      localStorage.setItem('idsesion', response.idsesion.toString());
    }

  }

  /* ================= LOGOUT ================= */

  logout(): void {

    const idSesion = localStorage.getItem('idsesion');

    if (idSesion) {

      this.http.post(`${this.apiUrl}/logout/${idSesion}`, {})
        .subscribe({
          next: () => {
            this.clearSession();
          },
          error: () => {
            this.clearSession();
          }
        });

    } else {
      this.clearSession();
    }

  }

  private clearSession() {
    localStorage.clear();
    window.location.href = '/auth/login';
  }

  /* ================= GETTERS ================= */

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getIdSesion(): string | null {
    return localStorage.getItem('idsesion');
  }

  getIdUsuario(): string | null {
    return localStorage.getItem('idusuario');
  }

  /* ================= ESTADO LOGIN ================= */

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /* ================= REDIRECCIÓN POR ROL ================= */

  redirigirSegunRol() {

    const rol = this.getRol();

    if (!rol) {
      window.location.href = '/auth/login';
      return;
    }

    if (rol === 'DOCENTE') {
      window.location.href = '/docente/dashboard';
    }

    if (rol === 'COORDINADOR') {
      window.location.href = '/coordinador/dashboard';
    }

    if (rol === 'ADMIN') {
      window.location.href = '/admin/dashboard';
    }

  }

}
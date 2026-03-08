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

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        this.saveSession(response);
      })
    );
  }

  register(usuario: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, usuario);
  }

  private saveSession(response: LoginResponse): void {

    localStorage.setItem('token', response.token);
    localStorage.setItem('rol', response.rol);
    localStorage.setItem('idusuario', response.idusuario.toString());

    // 🔴 IMPORTANTE para expulsión de sesión
    if(response.idsesion){
      localStorage.setItem('idsesion', response.idsesion.toString());
    }

  }

logout(): void {

  const idSesion = localStorage.getItem('idsesion');

  if(idSesion){

    this.http.post(`${this.apiUrl}/logout/${idSesion}`, {})
      .subscribe({
        next: () => {
          localStorage.clear();
          window.location.href = '/auth/login';
        },
        error: () => {
          localStorage.clear();
          window.location.href = '/auth/login';
        }
      });

  } else {

    localStorage.clear();
    window.location.href = '/auth/login';

  }

}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    return localStorage.getItem('rol');
  }

  getIdSesion(): string | null {
    return localStorage.getItem('idsesion');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionMonitorService {

  private apiUrl = environment.apiUrl;

  sesionExpulsada$ = new BehaviorSubject<boolean>(false);

  private monitorActivo = false;

  constructor(private http: HttpClient) {}

  iniciarMonitoreo(): void {

    if (this.monitorActivo) return;

    this.monitorActivo = true;

    setInterval(() => {

  const idSesion = localStorage.getItem('idsesion');
  const token = localStorage.getItem('token');

  if (!idSesion || !token) return;

  this.http.get<boolean>(
    `${this.apiUrl}/api/sesiones/validar/${idSesion}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .subscribe({
    next: (activa) => {
      if (!activa) {
        console.warn('Sesión expulsada por administrador');
        this.sesionExpulsada$.next(true);
      }
    },
    error: (err) => {
      console.error('Error verificando sesión', err);
    }
  });

}, 5000);

  }

}
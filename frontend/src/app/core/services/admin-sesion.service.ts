import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Sesion {

  idsesion: number;
  idusuario: number;

  nombres: string;
  apellidos: string;
  nombrerol: string;

  ip: string;
  navegador: string;
  sistemaoperativo: string;

  fechalogin: string;

  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminSesionService {

  // CORREGIDO
  private apiUrl = environment.apiUrl + '/api/admin/sesiones';

  constructor(private http: HttpClient) {}

  listarSesiones(): Observable<Sesion[]> {
    return this.http.get<Sesion[]>(this.apiUrl);
  }

  banearSesion(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/ban`, {});
  }

  reporteSesiones(tipo: string): Observable<Sesion[]> {
    return this.http.get<Sesion[]>(
      `${this.apiUrl}/reporte?tipo=${tipo}`
    );
  }
}
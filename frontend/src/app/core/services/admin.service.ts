import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioAdmin } from '../models/usuario-admin.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = environment.apiUrl + '/api/admin';

  constructor(private http: HttpClient) {}

  listarUsuarios(): Observable<UsuarioAdmin[]> {
    return this.http.get<UsuarioAdmin[]>(`${this.apiUrl}/usuarios`);
  }

  cambiarEstado(id: number, activo: boolean): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/usuarios/${id}/estado?activo=${activo}`,
      {}
    );
  }

  obtenerUsuarioPorId(id: number): Observable<UsuarioAdmin> {
    return this.http.get<UsuarioAdmin>(
      `${this.apiUrl}/usuarios/${id}`
    );
  }

  actualizarUsuario(usuario: UsuarioAdmin): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/usuarios/${usuario.idusuario}`,
      usuario
    );
  }

  obtenerEstadisticas() {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  obtenerDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`);
  }

  obtenerUsuariosPorMes() {
    return this.http.get<any>(`${this.apiUrl}/usuarios/registro-mensual`);
  }
  
  ultimosUsuarios() {
  const token = localStorage.getItem('token');

  return this.http.get<any[]>(
    'http://localhost:8080/api/admin/ultimos-usuarios',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}
}
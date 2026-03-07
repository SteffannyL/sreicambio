import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioAdmin } from '../models/usuario-admin.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = 'http://localhost:8082/api/admin';

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

obtenerDashboard(): Observable<any>{
  return this.http.get<any>('http://localhost:8082/api/admin/dashboard');
}

obtenerUsuariosPorMes(){
  return this.http.get<any>('http://localhost:8082/api/admin/usuarios/registro-mensual');
}

}
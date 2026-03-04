import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AprobarEventoDTO {
  idevento: number;
  estado: string;
  comentario: string;
}

@Injectable({
  providedIn: 'root'
})
export class AprobacionEventoService {

  private apiUrl = 'http://localhost:8080/api/coordinador';

  constructor(private http: HttpClient) {}

  aprobarEvento(data: AprobarEventoDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/aprobar-evento`, data);
  }

  listarPendientes(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/coordinador/eventos-pendientes');
  }
}
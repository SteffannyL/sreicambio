import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocenteEventoService {

  private apiUrl = 'http://localhost:8080/api/docente';

  constructor(private http: HttpClient) {}

  listarMisEventos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/eventos`);
  }


  obtenerEventoPorId(id: number) {
  return this.http.get<any>(`http://localhost:8080/api/docente/eventos/${id}`);
}

}
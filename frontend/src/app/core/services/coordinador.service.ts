import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoordinadorService {

  private api = 'http://localhost:8080/api/coordinador';

  constructor(private http: HttpClient) {}

  listarPendientes(): Observable<any> {
    return this.http.get(`${this.api}/eventos-pendientes`);
  }

  aprobarEvento(data:any){
    return this.http.post(`${this.api}/aprobar-evento`,data,{responseType:'text'});
  }

  listarAprobados(): Observable<any> {
    return this.http.get(`${this.api}/eventos-aprobados`);
  }

  listarRechazados(): Observable<any> {
    return this.http.get(`${this.api}/eventos-rechazados`);
  }

  // 🔵 endpoint del dashboard
  getDashboard(): Observable<any> {
    return this.http.get(`${this.api}/dashboard`);
  }

}
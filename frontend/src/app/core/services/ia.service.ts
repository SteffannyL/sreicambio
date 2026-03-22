import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IaService {

  private apiUrl = 'http://localhost:8080/api/ia';

  constructor(private http: HttpClient) {}

  generarImagen(prompt: string) {
    return this.http.post<any>(`${this.apiUrl}/generar-imagen`, {
      prompt: prompt
    });
  }
}
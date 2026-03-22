import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocenteEventoService {

  private apiUrl = 'http://localhost:8080/api/docente';

  constructor(private http: HttpClient) {}

  /* ================= LISTAR EVENTOS ================= */

  listarMisEventos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/eventos`).pipe(
      map((eventos: any[]) => {

        return eventos.map(e => {

          // 🔥 NORMALIZAR IMAGEN
          let urlImagen = e.url_imagen || e.urlImagen || e.imagen || null;

          return {
            ...e,
            url_imagen: urlImagen
          };
        });

      })
    );
  }

  /* ================= DETALLE ================= */

  obtenerEventoPorId(id: number) {
    return this.http.get<any>(`${this.apiUrl}/eventos/${id}`);
  }

}
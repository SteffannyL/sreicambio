import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-crear-evento',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-evento.html'
})
export class CrearEventoComponent {

  evento = {
    idambito: 1,
    nombreevento: '',
    descripcion: '',
    fechainicio: '',
    fechafin: '',
    lugar: '',
    aforo: '',
    idtipoevento: 1
  };

  mensaje = '';
  error = '';

  constructor(private http: HttpClient) {}

  crearEvento() {

    this.mensaje = '';
    this.error = '';

    this.http.post(
      `${environment.apiUrl}/api/docente/eventos`,
      this.evento
    ).subscribe({
      next: (res: any) => {
        this.mensaje = res.mensaje;
      },
      error: (err) => {
        this.error = err.error?.mensaje || 'Error al crear evento';
      }
    });
  }
}
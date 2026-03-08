import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-mis-eventos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-eventos.component.html',
  styleUrls: ['./mis-eventos.component.css']
})
export class MisEventosComponent implements OnInit {

  eventos: any[] = [];
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarEventos();
  }

  cargarEventos() {

  const token = localStorage.getItem('token');

  this.http.get<any[]>(
    `${environment.apiUrl}/api/docente/eventos/1`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )
  .subscribe({

    next: (data) => {
      this.eventos = data;
    },

    error: (err) => {
      this.error = 'No se pudieron cargar los eventos';
      console.error(err);
    }

  });

}
}
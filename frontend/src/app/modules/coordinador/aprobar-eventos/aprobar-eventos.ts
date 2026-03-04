import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AprobacionEventoService } from '../../../core/services/aprobacion-evento.service';

@Component({
  selector: 'app-aprobar-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aprobar-eventos.html'
})
export class AprobarEventosComponent implements OnInit {

  eventos: any[] = [];

  constructor(private service: AprobacionEventoService) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos() {
    this.service.listarPendientes().subscribe(data => {

      // 🔥 Agregamos propiedad comentario a cada evento
      this.eventos = data.map(e => ({
        ...e,
        comentario: ''
      }));

    });
  }

  aprobar(evento: any) {
    this.service.aprobarEvento({
      idevento: evento.idevento,
      estado: 'aprobado',
      comentario: evento.comentario
    }).subscribe(() => {
      alert('Evento aprobado');
      this.cargarEventos();
    });
  }

  rechazar(evento: any) {
    this.service.aprobarEvento({
      idevento: evento.idevento,
      estado: 'rechazado',
      comentario: evento.comentario
    }).subscribe(() => {
      alert('Evento rechazado');
      this.cargarEventos();
    });
  }

}
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
    this.service.listarPendientes().subscribe({
      next: (res) => {
        this.eventos = res;
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
      }
    });
  }

  aprobar(evento: any) {

    const data = {
      idevento: evento.idevento,
      estado: 'aprobado',
      comentario: evento.comentario || ''
    };

    this.service.aprobarEvento(data).subscribe(() => {

      alert('Evento aprobado correctamente');

      this.cargarEventos();

    });

  }

  rechazar(evento: any) {

    if (!evento.comentario || evento.comentario.trim() === '') {

      alert('Debes escribir un comentario para rechazar');

      return;

    }

    const data = {
      idevento: evento.idevento,
      estado: 'rechazado',
      comentario: evento.comentario
    };

    this.service.aprobarEvento(data).subscribe(() => {

      alert('Evento rechazado');

      this.cargarEventos();

    });

  }

}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // 👈 IMPORTANTE
import { DocenteEventoService } from '../../../core/services/docente-evento.service';

@Component({
  selector: 'app-mis-eventos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-eventos.component.html',
  styleUrls: ['./mis-eventos.component.css']
})
export class MisEventosComponent implements OnInit {

  eventos: any[] = [];
  cargando = true;

  constructor(
    private eventoService: DocenteEventoService,
    private router: Router // 👈 INYECCIÓN
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos() {
    this.eventoService.listarMisEventos().subscribe({
      next: (data) => {
        this.eventos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
        this.cargando = false;
      }
    });
  }

  // 👇 AQUÍ YA NAVEGA
  verDetalle(evento: any) {
    this.router.navigate(['/docente/evento', evento.idevento]);
  }
}
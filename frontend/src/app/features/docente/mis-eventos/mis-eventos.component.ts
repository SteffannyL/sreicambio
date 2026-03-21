import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  

  // 🔥 URL base del backend (ajústalo si cambia)
  private baseUrl = 'http://localhost:8080/';

  constructor(
    private eventoService: DocenteEventoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos() {
    this.eventoService.listarMisEventos().subscribe({
      next: (data) => {
        console.log('EVENTOS BACKEND:', data); 
        console.log('EVENTOS:', this.eventos);
        this.eventos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
        this.cargando = false;
      }
    });
  }

  // 🔥 FORMATEAR IMAGEN
  getImagen(url: string | null): string {
    if (!url) {
      return '/img/logo.png';
    }
    return this.baseUrl + url;
  }

  // 🔥 FORMATEAR PDF
  getPdf(url: string | null): string {
    if (!url) {
      return '#';
    }
    return this.baseUrl + url;
  }

  // 👇 NAVEGAR A DETALLE
  verDetalle(evento: any) {
    this.router.navigate(['/docente/evento', evento.idevento]);
  }

  // 🔥 ABRIR PDF
  abrirPdf(url: string | null) {
    const pdfUrl = this.getPdf(url);
    if (pdfUrl !== '#') {
      window.open(pdfUrl, '_blank');
    }
  }
}
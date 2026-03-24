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
        this.eventos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando eventos', err);
        this.cargando = false;
      }
    });
  }

  /* ================= IMAGEN (FIX IA + NORMAL) ================= */

  getImagen(url: string | null): string {

    if (!url) {
      return '/img/logo.png';
    }

    // 🔥 IA (base64)
    if (url.startsWith('data:image')) {
      return url;
    }

    // 🔥 Archivo backend
    return this.baseUrl + url;
  }

  /* ================= PDF ================= */

  getPdf(url: string | null): string {
    if (!url) {
      return '#';
    }
    return this.baseUrl + url;
  }

  /* ================= NAVEGACIÓN ================= */

  verDetalle(evento: any) {
    this.router.navigate(['/docente/evento', evento.idevento]);
  }

  abrirPdf(url: string | null) {
    const pdfUrl = this.getPdf(url);
    if (pdfUrl !== '#') {
      window.open(pdfUrl, '_blank');
    }
  }
}
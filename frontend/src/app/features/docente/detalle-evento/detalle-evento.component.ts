import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DocenteEventoService } from '../../../core/services/docente-evento.service';

@Component({
  selector: 'app-detalle-evento',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-evento.component.html',
  styleUrls: ['./detalle-evento.component.css']
})
export class DetalleEventoComponent implements OnInit {

  evento: any = null;
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: DocenteEventoService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarEvento(id);
  }

  cargarEvento(id: number) {
    this.eventoService.obtenerEventoPorId(id).subscribe({
      next: (data) => {
        this.evento = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error cargando detalle', err);
        this.cargando = false;
      }
    });
  }

  volver() {
    this.router.navigate(['/docente/mis-eventos']);
  }
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-coordinador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'dashboard-coordinador.component.html',
  styleUrls: ['dashboard-coordinador.component.css']
})
export class DashboardCoordinadorComponent {

  eventosPendientes = 0;
  eventosAprobados = 0;
  eventosRechazados = 0;

  constructor(private router: Router) {}

  irAprobarEventos() {
    this.router.navigate(['/coordinador/aprobar-eventos']);
  }

}
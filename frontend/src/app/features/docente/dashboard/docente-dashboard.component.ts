import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './docente-dashboard.component.html',
  styleUrls: ['./docente-dashboard.component.css']
})
export class DocenteDashboardComponent {

  totalEventos = 0;
  eventosAprobados = 0;
  eventosPendientes = 0;

}
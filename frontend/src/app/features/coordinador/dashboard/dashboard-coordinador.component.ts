import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoordinadorService } from '../../../core/services/coordinador.service';

@Component({
  selector: 'app-dashboard-coordinador',
  standalone: true,
  imports:[CommonModule],
  templateUrl: './dashboard-coordinador.component.html',
  styleUrls: ['./dashboard-coordinador.component.css']
})
export class DashboardCoordinadorComponent implements OnInit {

  pendientes = 0;
  aprobados = 0;
  rechazados = 0;

  constructor(private coordinadorService:CoordinadorService){}

  ngOnInit(): void {

    this.cargarDashboard();

  }

  cargarDashboard(){

    this.coordinadorService.getDashboard().subscribe({

      next:(data)=>{

        console.log("Dashboard:",data);

        this.pendientes = data.pendientes;
        this.aprobados = data.aprobados;
        this.rechazados = data.rechazados;

      },

      error:(err)=>{
        console.error("Error cargando dashboard",err);
      }

    });

  }

}
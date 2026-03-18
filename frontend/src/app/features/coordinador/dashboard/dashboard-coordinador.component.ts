import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoordinadorService } from '../../../core/services/coordinador.service';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-dashboard-coordinador',
  standalone: true,
  imports:[CommonModule],
  templateUrl:'./dashboard-coordinador.component.html',
  styleUrls:['./dashboard-coordinador.component.css']
})
export class DashboardCoordinadorComponent implements OnInit {

  pendientes = 0;
  aprobados = 0;
  rechazados = 0;

  ultimosEventos:any[] = [];

  constructor(private service:CoordinadorService){}

  ngOnInit(): void {

    this.cargarDashboard();

  }

  cargarDashboard(){

    this.service.getDashboard().subscribe({

      next:(data)=>{

        this.pendientes = data.pendientes;
        this.aprobados = data.aprobados;
        this.rechazados = data.rechazados;

        this.crearGrafico();

      }

    });

  }

  crearGrafico(){

    new Chart("graficoEventos",{
      type:'doughnut',

      data:{
        labels:[
          'Pendientes',
          'Aprobados',
          'Rechazados'
        ],

        datasets:[{
          data:[
            this.pendientes,
            this.aprobados,
            this.rechazados
          ],

          backgroundColor:[
            '#f39c12',
            '#27ae60',
            '#c0392b'
          ]
        }]
      },

      options:{
        responsive:true,
        plugins:{
          legend:{
            position:'bottom'
          }
        }
      }

    });

  }

}
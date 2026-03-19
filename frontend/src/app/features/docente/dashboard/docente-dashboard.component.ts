import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DocenteEventoService } from '../../../core/services/docente-evento.service';
import { Chart } from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-docente-dashboard',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './docente-dashboard.component.html',
  styleUrls: ['./docente-dashboard.component.css']
})
export class DocenteDashboardComponent implements OnInit {

  totalEventos: number = 0;
  eventosAprobados: number = 0;
  eventosPendientes: number = 0;
  eventosRechazados: number = 0;

  nombreDocente: string = '';
  correoDocente: string = '';
  rolDocente: string = '';

  ultimosEventos: any[] = [];

  chart: Chart | null = null;

  constructor(private eventoService: DocenteEventoService) {}

  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarResumen();
  }

  cargarResumen(): void {
    this.eventoService.listarMisEventos().subscribe((data: any[]) => {

      this.totalEventos = data.length;

      this.eventosAprobados = data.filter(e => e.estado === 'APROBADO').length;

      this.eventosPendientes = data.filter(e => e.estado === 'PENDIENTE').length;

      this.eventosRechazados = data.filter(e => e.estado === 'RECHAZADO').length;

      this.ultimosEventos = data
        .sort((a, b) => new Date(b.fechainicio).getTime() - new Date(a.fechainicio).getTime())
        .slice(0, 5);

      this.crearGrafico();
    });
  }

  crearGrafico(): void {

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('graficoEventos', {
      type: 'doughnut',
      data: {
        labels: ['Aprobados', 'Pendientes', 'Rechazados'],
        datasets: [{
          data: [
            this.eventosAprobados,
            this.eventosPendientes,
            this.eventosRechazados
          ],
          backgroundColor: [
            '#28a745',
            '#ffc107',
            '#dc3545'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        animation: {
          duration: 1200
        },
        plugins: {
          legend: {
            position: 'bottom'
          },
          datalabels: {
            color: '#fff',
            font: {
              weight: 'bold',
              size: 14
            },
            formatter: (value: number, context: any) => {
              const data = context.chart.data.datasets[0].data;
              const total = data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total ? ((value / total) * 100).toFixed(1) : 0;
              return percentage + '%';
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });
  }

  cargarDatosUsuario(): void {
    this.nombreDocente = localStorage.getItem('nombre') || 'Docente';
    this.correoDocente = localStorage.getItem('correo') || '';
    this.rolDocente = localStorage.getItem('rol') || 'DOCENTE';
  }

}

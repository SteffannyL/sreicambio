import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  totalUsuarios: number = 0;
  activos: number = 0;
  inactivos: number = 0;

  meses: string[] = [];
  totalesMes: number[] = [];

  // 🔹 Instancias de gráficos (para evitar duplicación)
  pieChart: Chart | null = null;
  barraChart: Chart | null = null;
  lineaChart: Chart | null = null;

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    // 🔹 Carga inicial
    this.cargarEstadisticas();
    this.cargarUsuariosPorMes();

  }

  cargarEstadisticas(): void {

    this.adminService.obtenerDashboard().subscribe((data: any) => {

      this.totalUsuarios = data.total;
      this.activos = data.activos;
      this.inactivos = data.inactivos;

      this.crearGraficoPie();
      this.crearGraficoBarra();

      this.cd.detectChanges();

    });

  }

  cargarUsuariosPorMes(): void {

    this.adminService.obtenerUsuariosPorMes().subscribe((data: any) => {

      this.meses = data.map((item: any) => item.mes);
      this.totalesMes = data.map((item: any) => item.total);

      this.crearGraficoLinea();

      this.cd.detectChanges();

    });

  }

  crearGraficoPie(): void {

    if (this.pieChart) {
      this.pieChart.destroy();
    }

    this.pieChart = new Chart("graficoPie", {
      type: 'pie',
      data: {
        labels: ['Activos', 'Inactivos'],
        datasets: [{
          data: [this.activos, this.inactivos],
          backgroundColor: [
            '#26c6da',
            '#ef5350'
          ]
        }]
      }
    });

  }

  crearGraficoBarra(): void {

    if (this.barraChart) {
      this.barraChart.destroy();
    }

    this.barraChart = new Chart("graficoBarra", {
      type: 'bar',
      data: {
        labels: ['Total', 'Activos', 'Inactivos'],
        datasets: [{
          label: 'Usuarios',
          data: [
            this.totalUsuarios,
            this.activos,
            this.inactivos
          ],
          backgroundColor: [
            '#42a5f5',
            '#66bb6a',
            '#ef5350'
          ]
        }]
      }
    });

  }

  crearGraficoLinea(): void {

    if (this.lineaChart) {
      this.lineaChart.destroy();
    }

    this.lineaChart = new Chart("graficoLinea", {
      type: 'line',
      data: {
        labels: this.meses,
        datasets: [{
          label: 'Usuarios registrados',
          data: this.totalesMes,
          borderColor: '#26a69a',
          backgroundColor: '#80cbc4'
        }]
      }
    });

  }

}
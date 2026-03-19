import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { AdminSesionService } from '../../core/services/admin-sesion.service';
import { Chart } from 'chart.js/auto';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {

  totalUsuarios: number = 0;
  activos: number = 0;
  inactivos: number = 0;

  meses: string[] = [];
  totalesMes: number[] = [];

  // 👥 Usuarios conectados (sesiones)
  ultimosUsuarios: any[] = [];

  // 🆕 Usuarios registrados
  ultimosRegistrados: any[] = [];

  // Auto-refresh
  intervalo: any;

  // Gráficos
  pieChart: Chart | null = null;
  barraChart: Chart | null = null;
  lineaChart: Chart | null = null;

  constructor(
    private adminService: AdminService,
    private sesionService: AdminSesionService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarUsuariosPorMes();

    // 👇 separados correctamente
    this.cargarUltimosUsuarios();     // conectados
    this.cargarUltimosRegistrados();  // registrados

    // refresca solo sesiones
    this.intervalo = setInterval(() => {
      this.cargarUltimosUsuarios();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.intervalo) {
      clearInterval(this.intervalo);
    }
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

  // 👥 USUARIOS CONECTADOS (NO SE TOCA TU LÓGICA)
  cargarUltimosUsuarios(): void {
    this.sesionService.listarSesiones().subscribe((data: any[]) => {

      this.ultimosUsuarios = data
        .filter(s => this.esSesionReciente(s.fechalogin))
        .sort((a, b) => new Date(b.fechalogin).getTime() - new Date(a.fechalogin).getTime())
        .slice(0, 10);

      console.log('USUARIOS ONLINE:', this.ultimosUsuarios);

      this.cd.detectChanges();
    });
  }

  // 🆕 USUARIOS REGISTRADOS (NUEVO)
  cargarUltimosRegistrados(): void {
    this.adminService.ultimosUsuarios().subscribe((data: any[]) => {

      this.ultimosRegistrados = data;

      console.log('ÚLTIMOS REGISTRADOS:', this.ultimosRegistrados);

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

  // 👇 TU LÓGICA ORIGINAL (SE MANTIENE)
  esSesionReciente(fecha: string): boolean {
    if (!fecha) return false;

    const fechaParseada = new Date(fecha.replace(' ', 'T'));

    if (isNaN(fechaParseada.getTime())) return false;

    const ahora = new Date().getTime();
    const login = fechaParseada.getTime();

    const diferenciaMinutos = (ahora - login) / 1000 / 60;

    return diferenciaMinutos < 5;
  }

}
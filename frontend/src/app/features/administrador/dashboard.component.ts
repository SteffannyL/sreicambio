import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { AdminSesionService } from '../../core/services/admin-sesion.service';
import { Chart } from 'chart.js/auto';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventoRefreshService } from '../../core/services/evento-refresh.service';

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
  totalEventos: number = 0;

  meses: string[] = [];
  totalesMes: number[] = [];

  ultimosUsuarios: any[] = [];
  ultimosRegistrados: any[] = [];
  eventos: any[] = [];

  intervalo: any;

  pieChart: Chart | null = null;
  barraChart: Chart | null = null;
  lineaChart: Chart | null = null;
  eventosChart: Chart | null = null;

  constructor(
    private adminService: AdminService,
    private sesionService: AdminSesionService,
    private cd: ChangeDetectorRef,
    private eventoRefresh: EventoRefreshService
  ) {}

 ngOnInit(): void {
  // 🔥 CARGA INICIAL
  this.cargarEstadisticas();
  this.cargarUsuariosPorMes();

  this.cargarUltimosUsuarios();
  this.cargarUltimosRegistrados();

  this.cargarTotalEventos();
  this.cargarEventos();

  // 🔥 SOLO sesiones en tiempo real
  this.intervalo = setInterval(() => {
    this.cargarUltimosUsuarios();
  }, 10000);

  //  EVENTO CREADO (en vivo)
  this.eventoRefresh.eventoCreado$.subscribe(() => {
    console.log('Evento creado → actualizando dashboard');

    this.cargarEventos();
    this.cargarTotalEventos();

    this.cd.detectChanges(); //  asegura render inmediato
  });

  //  EVENTO ACTUALIZADO (estado en vivo)
  this.eventoRefresh.eventoActualizado$.subscribe(() => {
    console.log('Evento actualizado → actualizando dashboard');

    this.cargarEventos();
    this.cargarTotalEventos();

    this.cd.detectChanges(); //  importante
  });
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

  cargarUltimosUsuarios(): void {
    this.sesionService.listarSesiones().subscribe((data: any[]) => {

      this.ultimosUsuarios = data
        .filter(s => this.esSesionReciente(s.fechalogin))
        .sort((a, b) => new Date(b.fechalogin).getTime() - new Date(a.fechalogin).getTime())
        .slice(0, 10);

      this.cd.detectChanges();
    });
  }

  cargarUltimosRegistrados(): void {
    this.adminService.ultimosUsuarios().subscribe((data: any[]) => {

      this.ultimosRegistrados = data;

      this.cd.detectChanges();
    });
  }

  cargarTotalEventos(): void {
    this.adminService.totalEventos().subscribe((data: number) => {

      this.totalEventos = data;

      this.cd.detectChanges();
    });
  }

cargarEventos(): void {
  this.adminService.listarEventos().subscribe((data: any[]) => {

    this.eventos = data.slice(0, 5);

    this.crearGraficoEventos();

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
          backgroundColor: ['#26c6da', '#ef5350']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            align: 'center'
          }
        }
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
          ],
          barThickness: 40,
          maxBarThickness: 50
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
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

  crearGraficoEventos(): void {

    const estados = {
      PENDIENTE: 0,
      APROBADO: 0,
      RECHAZADO: 0
    };

    this.eventos.forEach(e => {
      const estado = e.estado as keyof typeof estados;

      if (estado in estados) {
        estados[estado]++;
      }
    });

    if (this.eventosChart) {
      this.eventosChart.destroy();
    }

    this.eventosChart = new Chart("graficoEventosDashboard", {
      type: 'doughnut',
      data: {
        labels: ['Pendientes', 'Aprobados', 'Rechazados'],
        datasets: [{
          data: [
            estados.PENDIENTE,
            estados.APROBADO,
            estados.RECHAZADO
          ],
          backgroundColor: [
            '#fbbf24',
            '#34d399',
            '#f87171'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

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
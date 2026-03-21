import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { EventoRefreshService } from '../../../core/services/evento-refresh.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-eventos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eventos.component.html',
  styleUrl: './eventos.component.css'
})
export class EventosComponent implements OnInit {

  eventos: any[] = [];
  chart: Chart | null = null;
  filtroActual: string = 'todos';
  eventosFiltrados: any[] = [];

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef,
    private eventoRefresh: EventoRefreshService
  ) {}

  ngOnInit(): void {

    // CARGA INICIAL
    this.cargarEventos();

    // EVENTO CREADO
    this.eventoRefresh.eventoCreado$.subscribe(() => {
      this.cargarEventos();
    });

    // EVENTO ACTUALIZADO
    this.eventoRefresh.eventoActualizado$.subscribe(() => {
      this.cargarEventos();
    });
  }

  aplicarFiltro(filtro: string) {

  this.filtroActual = filtro;

  if (filtro === 'todos') {
    this.eventosFiltrados = this.eventos;
  } else {
    this.eventosFiltrados = this.eventos.filter(e => {

      const estado = (e.estado || '').toUpperCase();

      if (filtro === 'pendientes') return estado.includes('PEND');
      if (filtro === 'aprobados') return estado.includes('APRO');
      if (filtro === 'rechazados') return estado.includes('RECH');

      return true;
    });
  }

  this.crearGrafico(); // 🔥 gráfico dinámico
}
  cargarEventos(): void {
    this.adminService.listarEventos().subscribe((data: any[]) => {

      console.log('EVENTOS RAW:', data);

      // 🔥 NORMALIZACIÓN UNIVERSAL
      this.eventos = data.map(e => {

        const nombre =
          e.nombre ||
          e.nombreevento ||
          e.nombre_evento ||
          'Sin nombre';

        const estado =
          e.estado ||
          e.estadoactual ||
          e.estado_evento ||
          'PENDIENTE';

        return {
          idevento: e.idevento || e.id,
          nombre: nombre,
          docente: e.docente || e.nombres || '---',
          fechainicio: e.fechainicio,
          fechafin: e.fechafin,
          estado: estado
        };
      });

      this.aplicarFiltro(this.filtroActual);

      // 🔥 PRIORIDAD DE ESTADOS
      const prioridadEstado: any = {
        PENDIENTE: 1,
        APROBADO: 2,
        RECHAZADO: 3
      };

      // 🔥 ORDENAMIENTO
      this.eventos.sort((a, b) => {

        const estadoA = (a.estado || '').toUpperCase();
        const estadoB = (b.estado || '').toUpperCase();

        const prioridadA =
          estadoA.includes('PEND') ? prioridadEstado.PENDIENTE :
          estadoA.includes('APRO') ? prioridadEstado.APROBADO :
          estadoA.includes('RECH') ? prioridadEstado.RECHAZADO : 99;

        const prioridadB =
          estadoB.includes('PEND') ? prioridadEstado.PENDIENTE :
          estadoB.includes('APRO') ? prioridadEstado.APROBADO :
          estadoB.includes('RECH') ? prioridadEstado.RECHAZADO : 99;

        return prioridadA - prioridadB;
      });

      // 🔥 GRÁFICO
      this.crearGrafico();

      this.cd.detectChanges();
    });
  }

  crearGrafico(): void {

    const estados = {
      PENDIENTE: 0,
      APROBADO: 0,
      RECHAZADO: 0
    };

    this.eventosFiltrados.forEach(e => {

      const estado = (e.estado || '').toUpperCase();

      if (estado.includes('PEND')) estados.PENDIENTE++;
      else if (estado.includes('APRO')) estados.APROBADO++;
      else if (estado.includes('RECH')) estados.RECHAZADO++;
    });

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('graficoEventos', {
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
        maintainAspectRatio: false,
        cutout: '60%'
      }
    });
  }
  filtrarEventos(filtro: string): any[] {

  if (filtro === 'todos') return this.eventos;

  return this.eventos.filter(e => {

    const estado = (e.estado || '').toUpperCase();

    if (filtro === 'pendientes') return estado.includes('PEND');
    if (filtro === 'aprobados') return estado.includes('APRO');
    if (filtro === 'rechazados') return estado.includes('RECH');

    return true;
  });
}


generarPDFEventos(filtro: string) {

  const doc = new jsPDF();
  const fecha = new Date().toLocaleString();

  const nombre = localStorage.getItem('nombre') || 'Administrador';
  const correo = localStorage.getItem('correo') || '---';
  const rol = localStorage.getItem('rol') || '---';

  const eventosFiltrados = this.filtrarEventos(filtro);

  const columnas = [
    'ID',
    'Evento',
    'Docente',
    'Fecha Inicio',
    'Fecha Fin',
    'Estado'
  ];

  const filas = eventosFiltrados.map(e => [
    e.idevento,
    e.nombre,
    e.docente,
    e.fechainicio,
    e.fechafin,
    e.estado
  ]);

  const generarDocumento = (doc: jsPDF) => {

    doc.setFontSize(18);
    doc.text(
      'Sistema de Registro de Eventos Interculturales',
      105,
      20,
      { align: 'center' }
    );

    doc.setFontSize(14);
    doc.text(
      `Reporte de Eventos (${filtro.toUpperCase()})`,
      105,
      28,
      { align: 'center' }
    );

    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, 14, 40);
    doc.text(`Generado por: ${nombre}`, 14, 46);
    doc.text(`Correo: ${correo}`, 14, 52);
    doc.text(`Rol: ${rol}`, 14, 58);

    doc.line(14, 62, 196, 62);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 68,
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [11, 122, 59], // verde UTEQ 🔥
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },

      didDrawPage: (data) => {

        const pageCount = doc.getNumberOfPages();
        const pageSize = doc.internal.pageSize;

        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();

        doc.setFontSize(9);

        doc.text(
          'Sistema de Registro de Eventos Interculturales',
          14,
          pageHeight - 10
        );

        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          pageSize.width - 50,
          pageHeight - 10
        );
      }
    });

    doc.save(`reporte_eventos_${filtro}.pdf`);
  };

  this.convertirImagenBase64(window.location.origin + '/img/logo.png')
    .then((logoBase64) => {
      doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
      generarDocumento(doc);
    })
    .catch(() => {
      generarDocumento(doc);
    });
}

exportarExcelEventos(filtro: string): void {

  const fecha = new Date().toLocaleString();

  const nombre = localStorage.getItem('nombre') || 'Administrador';
  const correo = localStorage.getItem('correo') || '---';
  const rol = localStorage.getItem('rol') || '---';

  const eventosFiltrados = this.filtrarEventos(filtro);

  const data = eventosFiltrados.map(e => [
    e.idevento,
    e.nombre,
    e.docente,
    e.fechainicio,
    e.fechafin,
    e.estado
  ]);

  const encabezados = [
    ['ID','Evento','Docente','Fecha Inicio','Fecha Fin','Estado']
  ];

  const infoReporte = [
    ['Sistema de Registro de Eventos Interculturales'],
    [],
    [`Reporte de Eventos (${filtro.toUpperCase()})`],
    [`Fecha: ${fecha}`],
    [`Generado por: ${nombre}`],
    [`Correo: ${correo}`],
    [`Rol: ${rol}`],
    []
  ];

  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

  XLSX.utils.sheet_add_aoa(worksheet, infoReporte, { origin: 'A1' });
  XLSX.utils.sheet_add_aoa(worksheet, encabezados, { origin: 'A9' });
  XLSX.utils.sheet_add_aoa(worksheet, data, { origin: 'A10' });

  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 25 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 15 }
  ];

  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }
  ];

  const workbook: XLSX.WorkBook = {
    Sheets: { 'Eventos': worksheet },
    SheetNames: ['Eventos']
  };

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
  });

  saveAs(blob, `reporte_eventos_${filtro}.xlsx`);
}

convertirImagenBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {

    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };

    img.onerror = error => reject(error);

    img.src = url;
  });
}

}
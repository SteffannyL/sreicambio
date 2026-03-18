import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordinadorService } from '../../../core/services/coordinador.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-aprobar-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aprobar-eventos.html',
  styleUrls: ['./aprobar-eventos.css']
})
export class AprobarEventosComponent implements OnInit {

  eventos: any[] = [];
  eventosReporte: any[] = [];
  cargando = true;
  procesando = false;

  estadoSeleccionado = 'PENDIENTE';

  mostrarModal = false;
  eventoSeleccionado: number | null = null;
  observacion = '';

  constructor(private coordinadorService: CoordinadorService) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos() {

    this.cargando = true;

    this.coordinadorService.listarPendientes().subscribe({
      next: (data) => {
        this.eventos = data;
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  // 🔥 NUEVO
  cargarReporte() {
    this.coordinadorService.getReporteEventos(this.estadoSeleccionado)
      .subscribe(data => {
        this.eventos = data;
        this.eventosReporte = data;
      });
  }

  aprobarEvento(id: number) {

    if (this.procesando) return;

    this.procesando = true;

    const body = {
      idevento: id,
      estado: 'APROBADO',
      comentario: 'Evento aprobado por coordinador'
    };

    this.coordinadorService.aprobarEvento(body).subscribe({
      next: () => {
        this.procesando = false;
        this.cargarEventos();
      },
      error: () => this.procesando = false
    });
  }

  abrirModalRechazo(id: number) {
    this.eventoSeleccionado = id;
    this.mostrarModal = true;
    this.observacion = '';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.observacion = '';
    this.eventoSeleccionado = null;
  }

  confirmarRechazo(){

    if(this.procesando) return;

    if(!this.observacion.trim()){
      alert('Debe escribir una observación');
      return;
    }

    if(this.eventoSeleccionado === null) return;

    this.procesando = true;

    const body = {
      idevento: this.eventoSeleccionado,
      estado: 'RECHAZADO',
      comentario: this.observacion
    };

    this.coordinadorService.aprobarEvento(body).subscribe({

      next: () => {
        this.mostrarModal = false;
        this.observacion = '';
        this.eventoSeleccionado = null;
        this.procesando = false;
        this.cargarEventos();
      },

      error: () => this.procesando = false

    });

  }

  // 🔥 PDF
  generarPDF() {

    const doc = new jsPDF();

    const rows = this.eventosReporte.map(e => [
      e.idevento,
      e.nombreevento,
      e.nombreDocente,
      e.fechainicio
    ]);

    autoTable(doc, {
      head: [['ID','Evento','Docente','Fecha']],
      body: rows
    });

    doc.save('reporte-eventos.pdf');
  }

  // 🔥 EXCEL
  exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(this.eventosReporte);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Eventos');
    XLSX.writeFile(wb, 'reporte-eventos.xlsx');
  }

}
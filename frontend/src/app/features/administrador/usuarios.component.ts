import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { UsuarioAdmin } from '../../core/models/usuario-admin.model';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {

  usuarios: UsuarioAdmin[] = [];
  usuariosFiltrados: UsuarioAdmin[] = [];

  // 🔎 filtros
  filtroSeleccionado: string = 'todos';
  busqueda: string = '';

  // 📄 paginación
  paginaActual: number = 1;
  usuariosPorPagina: number = 10;
  usuariosPagina: UsuarioAdmin[] = [];
  totalPaginas: number = 1;

  constructor(
    private adminService: AdminService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  // 🔹 Cargar usuarios
  cargarUsuarios() {
    this.adminService.listarUsuarios().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.buscarUsuarios();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando usuarios', err);
      }
    });
  }

  // 🔹 Aplicar filtro
  aplicarFiltro() {
    this.buscarUsuarios();
  }

  // 🔹 Buscar usuarios
buscarUsuarios() {

  const texto = (this.busqueda || '').toLowerCase().trim();

  let base = [...this.usuarios];

  if (this.filtroSeleccionado === 'activos') {
    base = base.filter(u => u.activo);
  }
  else if (this.filtroSeleccionado === 'inactivos') {
    base = base.filter(u => !u.activo);
  }

  this.usuariosFiltrados = base.filter(u => {

    const nombres = (u.nombres || '').toLowerCase();
    const apellidos = (u.apellidos || '').toLowerCase();
    const correo = (u.correo || '').toLowerCase();

    return (
      nombres.includes(texto) ||
      apellidos.includes(texto) ||
      correo.includes(texto)
    );

  });

  this.paginaActual = 1;
  this.actualizarPaginacion();
}

  // 🔹 actualizar paginación
  actualizarPaginacion(){

    const inicio = (this.paginaActual - 1) * this.usuariosPorPagina;
    const fin = inicio + this.usuariosPorPagina;

    this.usuariosPagina = this.usuariosFiltrados.slice(inicio, fin);

    this.totalPaginas = Math.ceil(
      this.usuariosFiltrados.length / this.usuariosPorPagina
    );
  }

  // 🔹 página anterior
  paginaAnterior(){
    if(this.paginaActual > 1){
      this.paginaActual--;
      this.actualizarPaginacion();
    }
  }

  // 🔹 página siguiente
  paginaSiguiente(){
    if(this.paginaActual < this.totalPaginas){
      this.paginaActual++;
      this.actualizarPaginacion();
    }
  }

  // 🔹 Cambiar estado usuario
  cambiarEstado(usuario: UsuarioAdmin) {

  const nuevoEstado = !usuario.activo;

  this.adminService.cambiarEstado(usuario.idusuario, nuevoEstado)
    .subscribe({
      next: () => {

        usuario.activo = nuevoEstado;

        // 🔹 solo actualizar tabla, NO reiniciar búsqueda
        this.actualizarPaginacion();

        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error cambiando estado', err);
      }
    });
}

  // 🔹 Generar PDF
  generarPDF(filtro: string) {

    const doc = new jsPDF();
    const fecha = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text(
      `REPORTE DE USUARIOS (${filtro.toUpperCase()})`,
      105,
      15,
      { align: 'center' }
    );

    doc.setFontSize(10);
    doc.text(`Fecha de generación: ${fecha}`, 14, 25);
    doc.line(14, 28, 196, 28);

    const columnas = [
      'ID',
      'Nombres',
      'Apellidos',
      'Correo',
      'Tipo',
      'Estado'
    ];

    const filas = this.usuariosFiltrados.map(usuario => [
      usuario.idusuario,
      usuario.nombres,
      usuario.apellidos,
      usuario.correo,
      usuario.tipoUsuario,
      usuario.activo ? 'Activo' : 'Inactivo'
    ]);

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 35,
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });

    doc.save(`reporte_usuarios_${filtro}.pdf`);
  }

  // 🔹 Exportar Excel
  exportarExcel(): void {

    const fecha = new Date().toLocaleString();

    const data = this.usuariosFiltrados.map(usuario => [
      usuario.idusuario,
      usuario.nombres,
      usuario.apellidos,
      usuario.correo,
      usuario.tipoUsuario,
      usuario.activo ? 'Activo' : 'Inactivo'
    ]);

    const encabezados = [
      ['ID','Nombres','Apellidos','Correo','Tipo','Estado']
    ];

    const infoReporte = [
      ['SREI - Sistema de Registro de Eventos Interculturales'],
      [],
      ['Reporte de Usuarios'],
      [`Fecha de generación: ${fecha}`],
      []
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

    XLSX.utils.sheet_add_aoa(worksheet, infoReporte, { origin: 'A1' });
    XLSX.utils.sheet_add_aoa(worksheet, encabezados, { origin: 'A6' });
    XLSX.utils.sheet_add_aoa(worksheet, data, { origin: 'A7' });

    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 18 },
      { wch: 32 },
      { wch: 15 },
      { wch: 12 }
    ];

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Usuarios': worksheet },
      SheetNames: ['Usuarios']
    };

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array'
    });

    const blob = new Blob([excelBuffer], {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    saveAs(blob, 'reporte_usuarios.xlsx');
  }

  // 🔹 ir a primera página
irPrimeraPagina(){
  this.paginaActual = 1;
  this.actualizarPaginacion();
}

// 🔹 ir a última página
irUltimaPagina(){
  this.paginaActual = this.totalPaginas;
  this.actualizarPaginacion();
}

}
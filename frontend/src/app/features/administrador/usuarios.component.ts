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

  // filtros
  filtroSeleccionado: string = 'todos';
  busqueda: string = '';

  // paginación
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

  // Cargar usuarios
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

  // Aplicar filtro
  aplicarFiltro() {
    this.buscarUsuarios();
  }

  // Buscar usuarios
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

  this.usuariosFiltrados.sort((a, b) => {
  return (b.activo ? 1 : 0) - (a.activo ? 1 : 0);
});

  this.paginaActual = 1;
  this.actualizarPaginacion();
}

  //  actualizar paginación
  actualizarPaginacion(){

    const inicio = (this.paginaActual - 1) * this.usuariosPorPagina;
    const fin = inicio + this.usuariosPorPagina;

    this.usuariosPagina = this.usuariosFiltrados.slice(inicio, fin);

    this.totalPaginas = Math.ceil(
      this.usuariosFiltrados.length / this.usuariosPorPagina
    );
  }

  //  página anterior
  paginaAnterior(){
    if(this.paginaActual > 1){
      this.paginaActual--;
      this.actualizarPaginacion();
    }
  }

  //  página siguiente
  paginaSiguiente(){
    if(this.paginaActual < this.totalPaginas){
      this.paginaActual++;
      this.actualizarPaginacion();
    }
  }

  //  Cambiar estado usuario
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

// convertir imagen a base64
convertirImagenBase64(url: string): Promise<string> {
  return fetch(url)
    .then(res => res.blob())
    .then(blob => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    }));
}

// generar reporte pdf
generarPDF(filtro: string) {

  const doc = new jsPDF();
  const fecha = new Date().toLocaleString();

  const nombre = localStorage.getItem('nombre') || 'Administrador';
  const correo = localStorage.getItem('correo') || '---';
  const rol = localStorage.getItem('rol') || '---';

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

  const generarDocumento = (doc: jsPDF) => {

    // nombre del sistema
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text(
      'Sistema de Registro de Eventos Interculturales',
      105,
      20,
      { align: 'center' }
    );

    // titulo del reporte
    doc.setFontSize(14);
    doc.text(
      `Reporte de Usuarios (${filtro.toUpperCase()})`,
      105,
      28,
      { align: 'center' }
    );

    // fecha
    doc.setFontSize(10);
    doc.text(`Fecha: ${fecha}`, 14, 40);

    // informacion del administrador
    doc.text(`Generado por: ${nombre}`, 14, 46);
    doc.text(`Correo: ${correo}`, 14, 52);
    doc.text(`Rol: ${rol}`, 14, 58);

    // linea separadora
    doc.line(14, 62, 196, 62);

    // tabla
    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 68,
      styles: { fontSize: 9 },
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },

      // pie de pagina
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

    doc.save(`reporte_usuarios_${filtro}.pdf`);
  };

  // cargar logo
  this.convertirImagenBase64(window.location.origin + '/img/logo.png')
    .then((logoBase64) => {
      doc.addImage(logoBase64, 'PNG', 14, 10, 25, 25);
      generarDocumento(doc);
    })
    .catch(() => {
      console.warn('logo no cargado');
      generarDocumento(doc);
    });
}  

 // exportar excel
exportarExcel(): void {

  const fecha = new Date().toLocaleString();

  const nombre = localStorage.getItem('nombre') || 'Administrador';
  const correo = localStorage.getItem('correo') || '---';
  const rol = localStorage.getItem('rol') || '---';

  // datos
  const data = this.usuariosFiltrados.map(usuario => [
    usuario.idusuario,
    usuario.nombres,
    usuario.apellidos,
    usuario.correo,
    usuario.tipoUsuario,
    usuario.activo ? 'Activo' : 'Inactivo'
  ]);

  // encabezados de tabla
  const encabezados = [
    ['ID','Nombres','Apellidos','Correo','Tipo','Estado']
  ];

  // informacion del reporte (tipo pdf)
  const infoReporte = [
    ['Sistema de Registro de Eventos Interculturales'],
    [],
    ['Reporte de Usuarios'],
    [`Fecha: ${fecha}`],
    [`Generado por: ${nombre}`],
    [`Correo: ${correo}`],
    [`Rol: ${rol}`],
    []
  ];

  const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

  // agregar bloques
  XLSX.utils.sheet_add_aoa(worksheet, infoReporte, { origin: 'A1' });
  XLSX.utils.sheet_add_aoa(worksheet, encabezados, { origin: 'A9' });
  XLSX.utils.sheet_add_aoa(worksheet, data, { origin: 'A10' });

  // ancho de columnas
  worksheet['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 18 },
    { wch: 35 },
    { wch: 15 },
    { wch: 12 }
  ];

  // combinar celdas para titulo grande
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }, // sistema
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } }  // titulo
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

  // ir a primera página
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
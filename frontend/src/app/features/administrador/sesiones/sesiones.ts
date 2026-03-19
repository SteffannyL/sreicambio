import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminSesionService, Sesion } from '../../../core/services/admin-sesion.service';
import { interval } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sesiones.html',
  styleUrls: ['./sesiones.css']
})
export class SesionesComponent implements OnInit {

  sesiones: Sesion[] = [];

  mostrarModal = false;
  sesionSeleccionada: Sesion | null = null;
  totalSesiones = 0;

  constructor(private sesionService: AdminSesionService) {}

  ngOnInit(): void {

    this.cargarSesiones();

    interval(10000).subscribe(()=>{
      this.cargarSesiones();
    });

  }

  cargarSesiones(){
    this.sesionService.listarSesiones()
      .subscribe((data:Sesion[]) => {
        this.sesiones = data;
        this.totalSesiones = data.length;
      });
  }

  cargarTodasSesiones(){
    this.sesionService.reporteSesiones('todas')
      .subscribe((data:Sesion[]) => {
        this.sesiones = data;
        this.totalSesiones = data.length;
      });
  }

  confirmarExpulsion(sesion:Sesion){
    this.sesionSeleccionada = sesion;
    this.mostrarModal = true;
  }

  cerrarModal(){
    this.mostrarModal = false;
    this.sesionSeleccionada = null;
  }

  expulsarSesion(){
    if(!this.sesionSeleccionada) return;

    this.sesionService.banearSesion(this.sesionSeleccionada.idsesion)
      .subscribe(()=>{
        this.cargarSesiones();
        this.cerrarModal();
      });
  }

  esSesionReciente(fecha:string):boolean{
    const ahora = new Date().getTime();
    const login = new Date(fecha).getTime();
    const diferenciaMinutos = (ahora - login) / 1000 / 60;
    return diferenciaMinutos < 5;
  }

  obtenerNavegador(userAgent:string):string{
    userAgent = userAgent.toLowerCase();
    if(userAgent.includes('edg')) return 'Edge';
    if(userAgent.includes('chrome')) return 'Chrome';
    if(userAgent.includes('firefox')) return 'Firefox';
    if(userAgent.includes('safari')) return 'Safari';
    return 'Desconocido';
  }

  obtenerSistema(userAgent:string):string{
    userAgent = userAgent.toLowerCase();
    if(userAgent.includes('windows')) return 'Windows';
    if(userAgent.includes('android')) return 'Android';
    if(userAgent.includes('iphone')) return 'iPhone';
    if(userAgent.includes('ipad')) return 'iPad';
    if(userAgent.includes('mac')) return 'MacOS';
    if(userAgent.includes('linux')) return 'Linux';
    return 'Desconocido';
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

  // generar pdf sesiones
  generarPDFSesiones(tipo:string){

    const doc = new jsPDF();
    const fecha = new Date().toLocaleString();

    const nombre = localStorage.getItem('nombre') || 'Administrador';
    const correo = localStorage.getItem('correo') || '---';
    const rol = localStorage.getItem('rol') || '---';

    const columnas = [
      'Usuario',
      'Rol',
      'IP',
      'Navegador',
      'Sistema',
      'Fecha login'
    ];

    const filas = this.sesiones.map(s => [
      `${s.nombres} ${s.apellidos}`,
      s.nombrerol,
      s.ip,
      this.obtenerNavegador(s.navegador),
      this.obtenerSistema(s.sistemaoperativo),
      s.fechalogin.split('.')[0]
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
        `Reporte de Sesiones (${tipo.toUpperCase()})`,
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
          fillColor: [33, 150, 243],
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

      doc.save(`reporte_sesiones_${tipo}.pdf`);
    };

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

  // exportar excel sesiones
  exportarExcelSesiones(tipo:string):void{

    const fecha = new Date().toLocaleString();

    const data = this.sesiones.map(s => [
      `${s.nombres} ${s.apellidos}`,
      s.nombrerol,
      s.ip,
      this.obtenerNavegador(s.navegador),
      this.obtenerSistema(s.sistemaoperativo),
      s.fechalogin.split('.')[0]
    ]);

    const encabezados = [
      ['Usuario','Rol','IP','Navegador','Sistema','Fecha login']
    ];

    const infoReporte = [
      ['Sistema de Registro de Eventos Interculturales'],
      [],
      [`Reporte de Sesiones (${tipo.toUpperCase()})`],
      [`Fecha: ${fecha}`],
      []
    ];

    const worksheet:XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

    XLSX.utils.sheet_add_aoa(worksheet, infoReporte, {origin:'A1'});
    XLSX.utils.sheet_add_aoa(worksheet, encabezados, {origin:'A6'});
    XLSX.utils.sheet_add_aoa(worksheet, data, {origin:'A7'});

    worksheet['!cols'] = [
      {wch:25},
      {wch:15},
      {wch:15},
      {wch:18},
      {wch:15},
      {wch:22}
    ];

    const workbook:XLSX.WorkBook = {
      Sheets:{'Sesiones':worksheet},
      SheetNames:['Sesiones']
    };

    const excelBuffer = XLSX.write(workbook,{
      bookType:'xlsx',
      type:'array'
    });

    const blob = new Blob([excelBuffer],{
      type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    });

    saveAs(blob, `reporte_sesiones_${tipo}.xlsx`);
  }

  generarReporte(event:any){

    const valor = event.target.value;

    if(valor === 'pdf-activas'){
      this.generarPDFSesiones('activas');
    }

    if(valor === 'pdf-historial'){
      this.generarPDFSesiones('historial');
    }

    if(valor === 'excel-activas'){
      this.exportarExcelSesiones('activas');
    }

    if(valor === 'excel-historial'){
      this.exportarExcelSesiones('historial');
    }

  }

}
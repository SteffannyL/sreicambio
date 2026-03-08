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

  sesiones: Sesion[] = []

  mostrarModal = false
  sesionSeleccionada: Sesion | null = null
  totalSesiones = 0

  constructor(private sesionService: AdminSesionService) {}

  ngOnInit(): void {

    this.cargarSesiones()

    interval(10000).subscribe(()=>{
      this.cargarSesiones()
    })

  }

  cargarSesiones(){

  this.sesionService.listarSesiones()
    .subscribe((data:Sesion[]) => {

      console.log("SESIONES:", data)

      this.sesiones = data
      this.totalSesiones = data.length

    })

}
  
  cargarTodasSesiones(){

  this.sesionService.reporteSesiones('todas')
    .subscribe((data:Sesion[]) => {

      console.log("HISTORIAL SESIONES:", data)

      this.sesiones = data
      this.totalSesiones = data.length

    })

}

  confirmarExpulsion(sesion:Sesion){

    this.sesionSeleccionada = sesion
    this.mostrarModal = true

  }

  cerrarModal(){

    this.mostrarModal = false
    this.sesionSeleccionada = null

  }

  expulsarSesion(){

    if(!this.sesionSeleccionada) return

    this.sesionService.banearSesion(this.sesionSeleccionada.idsesion)
      .subscribe(()=>{

        this.cargarSesiones()
        this.cerrarModal()

      })

  }

  esSesionReciente(fecha:string):boolean{

    const ahora = new Date().getTime()
    const login = new Date(fecha).getTime()

    const diferenciaMinutos = (ahora - login) / 1000 / 60

    return diferenciaMinutos < 5

  }

  obtenerNavegador(userAgent:string):string{

    userAgent = userAgent.toLowerCase()

    if(userAgent.includes('edg')) return 'Edge'
    if(userAgent.includes('chrome')) return 'Chrome'
    if(userAgent.includes('firefox')) return 'Firefox'
    if(userAgent.includes('safari')) return 'Safari'

    return 'Desconocido'

  }

  obtenerSistema(userAgent:string):string{

    userAgent = userAgent.toLowerCase()

    if(userAgent.includes('windows')) return 'Windows'
    if(userAgent.includes('android')) return 'Android'
    if(userAgent.includes('iphone')) return 'iPhone'
    if(userAgent.includes('ipad')) return 'iPad'
    if(userAgent.includes('mac')) return 'MacOS'
    if(userAgent.includes('linux')) return 'Linux'

    return 'Desconocido'

  }

      // 🔹 Generar PDF de sesiones
    generarPDFSesiones(tipo:string){

  const doc = new jsPDF();
  const fecha = new Date().toLocaleString();

  doc.setFontSize(18);
   doc.text(
    `REPORTE DE SESIONES (${tipo.toUpperCase()})`,
    105,
    15,
    { align: 'center' }
    );

  doc.setFontSize(10);
  doc.text(`Fecha de generación: ${fecha}`, 14, 25);
  doc.line(14, 28, 196, 28);

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

  doc.save(`reporte_sesiones_${tipo}.pdf`);

}

    // 🔹 Exportar Excel de sesiones
  exportarExcelSesiones(tipo:string):void{

  const fecha = new Date().toLocaleString()

  const data = this.sesiones.map(s => [

    `${s.nombres} ${s.apellidos}`,
    s.nombrerol,
    s.ip,
    this.obtenerNavegador(s.navegador),
    this.obtenerSistema(s.sistemaoperativo),
    s.fechalogin.split('.')[0]

  ])

  const encabezados = [
    ['Usuario','Rol','IP','Navegador','Sistema','Fecha login']
  ]

  const infoReporte = [
    ['SREI - Sistema de Registro de Eventos Interculturales'],
    [],
    [`Reporte de Sesiones (${tipo.toUpperCase()})`],
    [`Fecha de generación: ${fecha}`],
    []
  ]

  const worksheet:XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([])

  XLSX.utils.sheet_add_aoa(worksheet, infoReporte, {origin:'A1'})
  XLSX.utils.sheet_add_aoa(worksheet, encabezados, {origin:'A6'})
  XLSX.utils.sheet_add_aoa(worksheet, data, {origin:'A7'})

  worksheet['!cols'] = [

    {wch:25},
    {wch:15},
    {wch:15},
    {wch:18},
    {wch:15},
    {wch:22}

  ]

  const workbook:XLSX.WorkBook = {

    Sheets:{'Sesiones':worksheet},
    SheetNames:['Sesiones']

  }

  const excelBuffer = XLSX.write(workbook,{
    bookType:'xlsx',
    type:'array'
  })

  const blob = new Blob([excelBuffer],{

    type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'

  })

  saveAs(blob, `reporte_sesiones_${tipo}.xlsx`)

}

  generarReporte(event:any){

  const valor = event.target.value

  if(valor === 'pdf-activas'){
    this.generarPDFSesiones('activas')
  }

  if(valor === 'pdf-historial'){
    this.generarPDFSesiones('historial')
  }

  if(valor === 'excel-activas'){
    this.exportarExcelSesiones('activas')
  }

  if(valor === 'excel-historial'){
    this.exportarExcelSesiones('historial')
  }

}

}
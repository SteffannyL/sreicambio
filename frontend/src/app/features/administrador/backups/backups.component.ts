import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BackupService } from '../../../core/services/backup.service';

@Component({
  selector: 'app-backups',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backups.component.html',
  styleUrls: ['./backups.component.css']
})
export class BackupsComponent implements OnInit {

  backups:any[]=[];

  bases:any[]=[];
  basesFiltradas:any[]=[];
  mostrarTodas = false;

  carpeta='G:/Mi unidad/backups_srei';

  fechaProgramada='';
  intervaloTiempo=1;
  intervaloTipo='dias';

  mensaje='';
  creando=false;

  nombreNuevaDb = '';
  backupSeleccionado = '';
  dbRestore = '';
  dbCambiar = '';

  dbActual: string = '';

  constructor(public backupService:BackupService){}

  ngOnInit():void{
    this.cargarHistorial();
    this.cargarBases();
    this.obtenerDbActual();
  }

  cargarBases(){
    this.backupService.listarBases()
    .subscribe((data:any)=>{
      this.bases = data;
      this.filtrarBases();
    });
  }

  filtrarBases(){
    if(this.mostrarTodas){
      this.basesFiltradas = this.bases;
    } else {
      this.basesFiltradas = this.bases.filter(b => b.vacia);
    }
  }

  toggleBases(){
    this.mostrarTodas = !this.mostrarTodas;
    this.filtrarBases();
  }

  crearBackup(){
    this.creando=true;
    this.mensaje='Creando backup...';

    this.backupService.crearBackup(this.carpeta)
    .subscribe({
      next:(res:any)=>{
        this.mensaje='Backup creado en: '+res.ruta;
        this.creando=false;
        this.cargarHistorial();
      },
      error:()=>{
        this.mensaje='Error creando backup';
        this.creando=false;
      }
    });
  }

  cargarHistorial(){
    this.backupService.historial()
    .subscribe((data:any)=>{
      this.backups=data;
    });
  }

  restaurar(nombre:string){
    if(confirm('¿Restaurar este backup?')){
      this.mensaje='Restaurando base de datos...';
      this.backupService.restaurar(nombre)
      .subscribe(()=>{
        this.mensaje='Base de datos restaurada correctamente';
      });
    }
  }

  descargar(nombre:string){
    this.backupService.descargar(nombre)
    .subscribe((blob:any)=>{
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombre;
      a.click();
      window.URL.revokeObjectURL(url);
    },()=>{
      this.mensaje="Error descargando backup";
    });
  }

  programarFecha(){
    this.backupService.programarFecha(this.carpeta,this.fechaProgramada)
    .subscribe(()=>{
      this.mensaje='Backup programado correctamente';
    });
  }

  programarIntervalo(){
    this.backupService.programarIntervalo(
      this.carpeta,
      this.intervaloTiempo,
      this.intervaloTipo
    ).subscribe(()=>{
      this.mensaje='Backup automático configurado';
    });
  }

  cancelarProgramacion(){
    this.backupService.cancelarProgramacion()
    .subscribe(()=>{
      this.mensaje="Backup automático cancelado";
    });
  }

  crearDb() {

    if (!this.nombreNuevaDb.trim()) {
      this.mensaje = 'Ingrese nombre de base de datos';
      return;
    }

    this.mensaje = 'Creando base...';

    this.backupService.crearDb(this.nombreNuevaDb)
    .subscribe({
      next: () => {
        this.mensaje = 'Base creada: ' + this.nombreNuevaDb;
        this.cargarBases();
      },
      error: () => {
        this.mensaje = 'Error creando base';
      }
    });
  }

  restaurarEnNuevaDb() {

    if (!this.backupSeleccionado || !this.dbRestore) {
      this.mensaje = 'Seleccione backup y base';
      return;
    }

    const db = this.bases.find(b => b.nombre === this.dbRestore);

    if (db && !db.vacia) {
      const confirmar = confirm(
        `⚠️ ATENCIÓN\n\nLa base "${this.dbRestore}" tiene datos.\nSe eliminarán completamente.\n\n¿Deseas continuar?`
      );
      if (!confirmar) return;
    }

    this.mensaje = 'Restaurando...';

    this.backupService.restaurarEnDb(
      this.backupSeleccionado,
      this.dbRestore
    ).subscribe({
      next: () => {
        this.mensaje = 'Restaurado en: ' + this.dbRestore;
      },
      error: () => {
        this.mensaje = 'Error restaurando';
      }
    });
  }

  cambiarDb() {

    if (!this.dbCambiar) {
      this.mensaje = 'Seleccione base';
      return;
    }

    this.backupService.cambiarDb(this.dbCambiar)
    .subscribe(()=>{
      this.mensaje='Base cambiada. REINICIA BACKEND';
    });
  }
  obtenerDbActual(){
  this.backupService.obtenerDbActual()
    .subscribe({
      next: (resp)=>{
        this.dbActual = resp.database;
      },
      error: ()=>{
        this.dbActual = 'Desconocida';
      }
    });
}
}
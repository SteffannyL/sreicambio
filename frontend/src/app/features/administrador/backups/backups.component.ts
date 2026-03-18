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

  carpeta='G:/Mi unidad/backups_srei';

  fechaProgramada='';

  intervaloTiempo=1;
  intervaloTipo='dias';

  mensaje='';
  creando=false;

  constructor(public backupService:BackupService){}

  ngOnInit():void{
    this.cargarHistorial();
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

    this.backupService.programarFecha(
      this.carpeta,
      this.fechaProgramada
    ).subscribe(()=>{

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
}
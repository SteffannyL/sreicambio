import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
providedIn: 'root'
})
export class BackupService {

private api = 'http://localhost:8080/api/admin/backup';

constructor(private http: HttpClient) {}

crearBackup(carpeta:string){
return this.http.post(`${this.api}/crear`,{carpeta});
}

historial(){
return this.http.get(`${this.api}/historial`);
}

descargar(nombre:string){
return this.http.get(
`${this.api}/descargar/${nombre}`,
{ responseType:'blob'}
);
}

restaurar(nombre:string){
return this.http.post(`${this.api}/restaurar/${nombre}`,{});
}

programarFecha(carpeta:string,fecha:string){
return this.http.post(`${this.api}/programar`,{carpeta,fecha});
}

programarIntervalo(carpeta:string,tiempo:number,tipo:string){
return this.http.post(`${this.api}/programar-intervalo`,{
carpeta,
tiempo,
tipo
});
}

cancelarProgramacion(){
return this.http.post(`${this.api}/cancelar-programacion`,{});
}

}
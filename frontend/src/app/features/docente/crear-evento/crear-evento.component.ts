import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-crear-evento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-evento.component.html',
  styleUrls: ['./crear-evento.component.css']
})
export class CrearEventoComponent implements OnInit {

  constructor(private http: HttpClient) {}

  evento = {
    idambito: 0,
    idtipoevento: 0,
    nombreevento: '',
    descripcion: '',
    fechainicio: '',
    fechafin: '',
    lugar: '',
    aforo: 0
  };

  // NUEVO: archivos
  imagen: File | null = null;
  pdf: File | null = null;

  // listas desde API
  ambitos: any[] = [];
  tiposEvento: any[] = [];

  mensaje = '';

  fechaActual: string = new Date().toISOString().slice(0,16);

  ngOnInit(): void {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // cargar ámbitos
    this.http.get<any[]>(
      'http://localhost:8080/api/docente/ambitos',
      { headers }
    ).subscribe(data => {
      this.ambitos = data;
    });

    // cargar tipos de evento
    this.http.get<any[]>(
      'http://localhost:8080/api/docente/tipos-evento',
      { headers }
    ).subscribe(data => {
      this.tiposEvento = data;
    });

  }

  // NUEVO: capturar imagen
  onImagenSeleccionada(event: any) {
    this.imagen = event.target.files[0];
    console.log('Imagen seleccionada:', this.imagen);
  }

  // NUEVO: capturar pdf
  onPdfSeleccionado(event: any) {
    this.pdf = event.target.files[0];
    console.log('PDF seleccionado:', this.pdf);
  }

  crearEvento() {

  const token = localStorage.getItem('token');

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  const formData = new FormData();

  // datos del evento
  formData.append('idambito', this.evento.idambito.toString());
  formData.append('idtipoevento', this.evento.idtipoevento.toString());
  formData.append('nombreevento', this.evento.nombreevento);
  formData.append('descripcion', this.evento.descripcion);
  formData.append('fechainicio', this.evento.fechainicio);
  formData.append('fechafin', this.evento.fechafin);
  formData.append('lugar', this.evento.lugar);
  formData.append('aforo', this.evento.aforo.toString());

  // archivos
  if (this.imagen) {
    formData.append('imagen', this.imagen);
  }

  if (this.pdf) {
    formData.append('pdf', this.pdf);
  }

  this.http.post(
  'http://localhost:8080/api/docente/eventos',
  formData,
)
  .subscribe({
    next: (resp: any) => {

      console.log(resp);

      this.mensaje = resp.mensaje;

      this.evento = {
        idambito: 0,
        idtipoevento: 0,
        nombreevento: '',
        descripcion: '',
        fechainicio: '',
        fechafin: '',
        lugar: '',
        aforo: 0
      };

      this.imagen = null;
      this.pdf = null;

    },
    error: (err) => {

      console.error(err);

      if (err.status === 403) {
        this.mensaje = "No autorizado. Sesión inválida.";
      } else {
        this.mensaje = "Error al crear evento";
      }

    }
  });

}

}
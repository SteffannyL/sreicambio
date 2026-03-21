import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { EventoRefreshService } from '../../../core/services/evento-refresh.service';

@Component({
  selector: 'app-crear-evento',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-evento.component.html',
  styleUrls: ['./crear-evento.component.css']
})
export class CrearEventoComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private router: Router,
    private eventoRefresh: EventoRefreshService
  ) {}

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

  imagen: File | null = null;
  pdf: File | null = null;

  ambitos: any[] = [];
  tiposEvento: any[] = [];

  mensaje = '';

  fechaActual: string = new Date().toISOString().slice(0,16);

  ngOnInit(): void {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>(
      'http://localhost:8080/api/docente/ambitos',
      { headers }
    ).subscribe(data => {
      this.ambitos = data;
    });

    this.http.get<any[]>(
      'http://localhost:8080/api/docente/tipos-evento',
      { headers }
    ).subscribe(data => {
      this.tiposEvento = data;
    });
  }

  onImagenSeleccionada(event: any) {
    this.imagen = event.target.files[0];
  }

  onPdfSeleccionado(event: any) {
    this.pdf = event.target.files[0];
  }

  /* ================= VALIDACIONES ================= */

  validarFormulario(): boolean {

    if (
      this.evento.idambito === 0 ||
      this.evento.idtipoevento === 0 ||
      !this.evento.nombreevento ||
      !this.evento.descripcion ||
      !this.evento.fechainicio ||
      !this.evento.fechafin ||
      !this.evento.lugar ||
      this.evento.aforo <= 0
    ) {
      this.mensaje = 'Por favor complete todos los campos obligatorios';
      return false;
    }

    // validar fechas
    if (this.evento.fechafin <= this.evento.fechainicio) {
      this.mensaje = 'La fecha fin debe ser mayor a la fecha inicio';
      return false;
    }

    return true;
  }

  /* ================= CONFIRMAR ENVÍO ================= */

  confirmarEnvio(form: any) {

    this.mensaje = '';

    if (!this.validarFormulario()) {
      return;
    }

    const confirmado = confirm('¿Está seguro de enviar el evento?');

    if (!confirmado) return;

    this.crearEvento();
  }

  /* ================= CREAR EVENTO ================= */

  crearEvento() {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const formData = new FormData();

    formData.append('idambito', this.evento.idambito.toString());
    formData.append('idtipoevento', this.evento.idtipoevento.toString());
    formData.append('nombreevento', this.evento.nombreevento);
    formData.append('descripcion', this.evento.descripcion);
    formData.append('fechainicio', this.evento.fechainicio);
    formData.append('fechafin', this.evento.fechafin);
    formData.append('lugar', this.evento.lugar);
    formData.append('aforo', this.evento.aforo.toString());

    if (this.imagen) {
      formData.append('imagen', this.imagen);
    }

    if (this.pdf) {
      formData.append('pdf', this.pdf);
    }

    this.http.post(
      'http://localhost:8080/api/docente/eventos',
      formData,
      { headers }
    )
    .subscribe({
      next: (resp: any) => {

        console.log(resp);

        this.mensaje = 'El evento ha sido enviado correctamente';

        // limpiar formulario
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

        // notificar actualización
        this.eventoRefresh.notificarEventoCreado();
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
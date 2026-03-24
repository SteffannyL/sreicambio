import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { EventoRefreshService } from '../../../core/services/evento-refresh.service';
import { IaService } from '../../../core/services/ia.service';

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
    private eventoRefresh: EventoRefreshService,
    private iaService: IaService
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

  modoImagen: 'upload' | 'ia' = 'upload';

  imagen: File | null = null;
  imagenPreview: string | null = null; // 🔥 preview upload
  pdf: File | null = null;

  imagenIA: string | null = null;
  cargandoIA = false;
  promptIA: string = '';

  ambitos: any[] = [];
  tiposEvento: any[] = [];

  mensaje = '';
  fechaActual: string = new Date().toISOString().slice(0,16);

  // 🔥 MODAL
  mostrarModal = false;
  modalMensaje = '';
  accionConfirmada: (() => void) | null = null;

  ngOnInit(): void {

    const token = localStorage.getItem('token');

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get<any[]>('http://localhost:8080/api/docente/ambitos', { headers })
      .subscribe(data => this.ambitos = data);

    this.http.get<any[]>('http://localhost:8080/api/docente/tipos-evento', { headers })
      .subscribe(data => this.tiposEvento = data);
  }

  /* ================= MODAL ================= */

  abrirModal(mensaje: string, accion?: () => void) {
    this.modalMensaje = mensaje;
    this.mostrarModal = true;
    this.accionConfirmada = accion || null;
  }

  confirmarModal() {
    if (this.accionConfirmada) {
      this.accionConfirmada();
    }
    this.cerrarModal();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.modalMensaje = '';
    this.accionConfirmada = null;
  }

  /* ================= IMAGEN ================= */

  onImagenSeleccionada(event: any) {
    this.imagen = event.target.files[0];
    this.imagenIA = null;

    if (this.imagen) {
      this.imagenPreview = URL.createObjectURL(this.imagen);
    }
  }

  onPdfSeleccionado(event: any) {
    this.pdf = event.target.files[0];
  }

  cambiarModoImagen() {
    if (this.modoImagen === 'upload') {
      this.imagenIA = null;
    } else {
      this.imagen = null;
      this.imagenPreview = null;
    }
  }

  /* ================= IA ================= */

  generarImagenIA() {

    if (this.modoImagen !== 'ia') return;

    if (!this.evento.nombreevento && !this.promptIA) {
      this.mensaje = 'Ingresa un nombre o escribe un prompt';
      return;
    }

    if (this.imagenIA) {
      this.abrirModal('Ya generaste una imagen. ¿Deseas reemplazarla?', () => {
        this.generarImagenIAReal();
      });
      return;
    }

    this.generarImagenIAReal();
  }

  private generarImagenIAReal() {

    this.cargandoIA = true;

    let promptFinal = this.promptIA;

    if (!promptFinal || promptFinal.trim().length < 5) {
      promptFinal = `
      Evento universitario profesional.
      Nombre: ${this.evento.nombreevento}
      Descripción: ${this.evento.descripcion}
      Estilo moderno, estudiantes, conferencia
      `;
    }

    this.iaService.generarImagen(promptFinal).subscribe({
      next: async (res: any) => {

        const comprimida = await this.compressImage(res.url, 0.7, 800);

        this.imagenIA = comprimida;
        this.imagen = null;
        this.imagenPreview = null;
        this.cargandoIA = false;
      },
      error: (err) => {
        console.error(err);
        this.cargandoIA = false;
        this.mensaje = 'Error generando imagen';
      }
    });
  }

  /* ================= COMPRESIÓN ================= */

  private compressImage(base64: string, quality: number = 0.7, maxWidth: number = 800): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;

        canvas.width = maxWidth;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
    });
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

    if (this.evento.fechafin <= this.evento.fechainicio) {
      this.mensaje = 'La fecha fin debe ser mayor a la fecha inicio';
      return false;
    }

    if (this.modoImagen === 'upload' && !this.imagen) {
      this.mensaje = 'Debe subir una imagen';
      return false;
    }

    if (this.modoImagen === 'ia' && !this.imagenIA) {
      this.mensaje = 'Debe generar una imagen con IA';
      return false;
    }

    return true;
  }

  /* ================= CONFIRMAR ================= */

  confirmarEnvio(form: NgForm) {

    this.mensaje = '';

    if (!this.validarFormulario()) return;

    this.abrirModal('¿Está seguro de enviar el evento?', () => {
      this.crearEvento(form);
    });
  }

  /* ================= CREAR EVENTO ================= */

  crearEvento(form: NgForm) {

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

    if (this.modoImagen === 'ia' && this.imagenIA) {
      formData.append('imagenIA', this.imagenIA);
    }

    if (this.modoImagen === 'upload' && this.imagen) {
      formData.append('imagen', this.imagen);
    }

    if (this.pdf) {
      formData.append('pdf', this.pdf);
    }

    this.http.post('http://localhost:8080/api/docente/eventos', formData, { headers })
    .subscribe({
      next: () => {

        this.mensaje = 'El evento ha sido enviado correctamente';

        form.resetForm();

        this.imagen = null;
        this.imagenPreview = null;
        this.imagenIA = null;
        this.pdf = null;
        this.promptIA = '';
        this.modoImagen = 'upload';

        this.eventoRefresh.notificarEventoCreado();
      },
      error: (err) => {
        console.error(err);
        this.mensaje = err.status === 403
          ? 'No autorizado. Sesión inválida.'
          : 'Error al crear evento';
      }
    });
  }
}
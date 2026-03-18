import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordinadorService } from '../../../core/services/coordinador.service';

@Component({
  selector: 'app-aprobar-eventos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aprobar-eventos.html',
  styleUrls: ['./aprobar-eventos.css']
})
export class AprobarEventosComponent implements OnInit {

  eventos: any[] = [];
  cargando = true;

  // evitar múltiples clics
  procesando = false;

  // modal rechazo
  mostrarModal = false;
  eventoSeleccionado: number | null = null;
  observacion = '';

  constructor(private coordinadorService: CoordinadorService) {}

  ngOnInit(): void {
    this.cargarEventos();
  }

  cargarEventos() {

    this.cargando = true;

    this.coordinadorService.listarPendientes().subscribe({

      next: (data) => {
        this.eventos = data;
        this.cargando = false;
      },

      error: (err) => {
        console.error(err);
        this.cargando = false;
      }

    });

  }

  aprobarEvento(id: number) {

    if (this.procesando) return;

    this.procesando = true;

    const body = {
      idevento: id,
      estado: 'APROBADO',
      comentario: 'Evento aprobado por coordinador'
    };

    this.coordinadorService.aprobarEvento(body).subscribe({

      next: () => {
        this.procesando = false;
        this.cargarEventos();
      },

      error: (err) => {
        console.error(err);
        this.procesando = false;
      }

    });

  }

  abrirModalRechazo(id: number) {
    this.eventoSeleccionado = id;
    this.mostrarModal = true;
    this.observacion = '';
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.observacion = '';
    this.eventoSeleccionado = null;
  }
confirmarRechazo(){

  if(this.procesando) return;

  if(!this.observacion.trim()){
    alert('Debe escribir una observación');
    return;
  }

  if(this.eventoSeleccionado === null) return;

  this.procesando = true;

  const body = {
    idevento: this.eventoSeleccionado,
    estado: 'RECHAZADO',
    comentario: this.observacion
  };

  this.coordinadorService.aprobarEvento(body).subscribe({

    next: () => {

      // cerrar modal inmediatamente
      this.mostrarModal = false;

      // limpiar campos
      this.observacion = '';
      this.eventoSeleccionado = null;

      this.procesando = false;

      // recargar tabla
      this.cargarEventos();

    },

    error: (err) => {
      console.error(err);
      this.procesando = false;
    }

  });

}

}
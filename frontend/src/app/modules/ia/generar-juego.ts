import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JuegoService } from '../../core/services/juego.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generar-juego',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './generar-juego.html',
  styleUrl: './generar-juego.css'
})
export class GenerarJuegoComponent implements OnInit {

  prompt: string = '';
  urlJuego: string = '';
  cargando = false;

  // modelos disponibles
  modelos: string[] = [];
  modeloSeleccionado: string = '';

  // dominio público de ngrok
  dominioPublico = "https://fully-noneducatory-noriko.ngrok-free.dev";

  constructor(private juegoService: JuegoService){}

  ngOnInit(){

    // obtener modelos de ollama automáticamente
    this.juegoService.obtenerModelos()
    .subscribe({
      next:(data)=>{

        console.log("Modelos detectados:", data);

        this.modelos = data;

        if(this.modelos.length > 0){
          this.modeloSeleccionado = this.modelos[0];
        }

      },
      error:(err)=>{
        console.error("Error cargando modelos", err);
      }
    });

  }

  generar(){

    if(!this.prompt.trim()){
      alert("Escribe una descripción del juego");
      return;
    }

    if(!this.modeloSeleccionado){
      alert("Selecciona un modelo de IA");
      return;
    }

    this.cargando = true;

    this.juegoService.generarJuego(this.prompt, this.modeloSeleccionado)
    .subscribe({

      next: (resp)=>{

        console.log("Respuesta backend:", resp);

        this.urlJuego = this.dominioPublico + resp.url;

        this.cargando = false;

      },

      error: (err)=>{
        console.error("Error generando juego", err);
        this.cargando = false;
      }

    });

  }

  copiarLink(){

    navigator.clipboard.writeText(this.urlJuego);

    alert("Link copiado. Puedes compartirlo.");

  }

}
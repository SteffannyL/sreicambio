import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JuegoService } from '../../core/services/juego.service';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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

  modelos: string[] = [];
  modeloSeleccionado: string = '';

  proveedor: string = 'ollama';

  // 🔥 NUEVO
  urlJuegoSeguro!: SafeResourceUrl;

  dominioPublico = "https://fully-noneducatory-noriko.ngrok-free.dev";

  constructor(
    private juegoService: JuegoService,
    private sanitizer: DomSanitizer // 🔥 FALTABA ESTO
  ){}

  ngOnInit(){

    this.juegoService.obtenerModelos()
    .subscribe({
      next:(data)=>{
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

    this.cargando = true;

    let modeloEnviar = this.modeloSeleccionado;

    if(this.proveedor === 'openai'){
      modeloEnviar = 'openai';
    }

    this.juegoService.generarJuego(this.prompt, modeloEnviar)
    .subscribe({

      next: (resp)=>{

        this.urlJuego = this.dominioPublico + resp.url;

        // 🔥 CLAVE: convertir a seguro para iframe
        this.urlJuegoSeguro = this.sanitizer.bypassSecurityTrustResourceUrl(this.urlJuego);

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
    alert("Link copiado");
  }

  compartir(){

    if(navigator.share){
      navigator.share({
        title: 'Quiz generado con IA',
        text: 'Mira este juego interactivo',
        url: this.urlJuego
      });
    } else {
      this.copiarLink();
      alert("Se copió el link (tu navegador no soporta compartir directo)");
    }

  }

fullscreen: boolean = false;

toggleFullscreen(){
  this.fullscreen = !this.fullscreen;

  if(this.fullscreen){
    document.body.classList.add('fullscreen-active');
  } else {
    document.body.classList.remove('fullscreen-active');
  }
}
}
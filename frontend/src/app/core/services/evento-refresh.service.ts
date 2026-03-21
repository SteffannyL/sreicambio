import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventoRefreshService {

  private eventoCreadoSource = new Subject<void>();
  private eventoActualizadoSource = new Subject<void>();

  eventoCreado$ = this.eventoCreadoSource.asObservable();
  eventoActualizado$ = this.eventoActualizadoSource.asObservable();

  notificarEventoCreado() {
    this.eventoCreadoSource.next();
  }

  notificarEventoActualizado() {
    this.eventoActualizadoSource.next();
  }
}
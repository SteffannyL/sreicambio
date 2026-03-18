import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar';
import { SidebarComponent } from './layout/sidebar/sidebar';
import { SessionMonitorService } from './core/services/session-monitor.service';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    SidebarComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {

  sesionExpulsada = false;
  mostrarNavbar = true;
  mostrarSidebar = true;

  constructor(
    private sessionMonitor: SessionMonitorService,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {

      const url = this.router.url;
      const token = localStorage.getItem('token');
      const rol = localStorage.getItem('rol');

      // ocultar navbar y sidebar en login
      if (url.startsWith('/auth')) {
        this.mostrarNavbar = false;
        this.mostrarSidebar = false;
        this.sesionExpulsada = false;
      } else {
        this.mostrarNavbar = true;
        this.mostrarSidebar = true;
      }

      // si ya está logueado y entra a login
      if (url === '/auth/login' && token) {

        if (rol === 'ADMIN') {
          this.router.navigate(['/admin/dashboard']);
        }

        else if (rol === 'DOCENTE') {
          this.router.navigate(['/docente/dashboard']);
        }

        else if (rol === 'COORDINADOR') {
          this.router.navigate(['/coordinador/dashboard']);
        }

      }

    });

    const token = localStorage.getItem('token');

    if (token) {
      this.sessionMonitor.iniciarMonitoreo();
    }

    this.sessionMonitor.sesionExpulsada$.subscribe(valor => {
      this.sesionExpulsada = valor;
    });

  }

  irLogin(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }

}
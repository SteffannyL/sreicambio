import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RouterModule } from '@angular/router';
import { LoginResponse } from '../../../core/models/login-response.model';
import { SessionMonitorService } from '../../../core/services/session-monitor.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  credentials = {
    correo: '',
    contrasena: ''
  };

  error = '';
  loading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private sessionMonitor: SessionMonitorService
  ) {}

  login(): void {

    this.error = '';
    this.loading = true;

    this.authService.login(this.credentials).subscribe({

      next: (res: LoginResponse) => {

        console.log('Login exitoso:', res);

        this.loading = false;

        // Iniciar monitoreo de sesión
        this.sessionMonitor.iniciarMonitoreo();

        // Redirección según rol
        switch (res.rol) {

          case 'ADMIN':
            this.router.navigate(['/admin/dashboard']);
            break;

          case 'DOCENTE':
            this.router.navigate(['/docente/dashboard']);
            break;

          case 'COORDINADOR':
            this.router.navigate(['/coordinador']);
            break;

          default:
            this.router.navigate(['/']);
        }

      },

      error: (err) => {

        console.error('Error login:', err);

        this.error = err.error?.message || 'Credenciales inválidas';
        this.loading = false;

      }

    });

  }

}
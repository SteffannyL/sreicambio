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

        /* GUARDAR DATOS EN LOCALSTORAGE */

        localStorage.setItem('token', res.token);
        localStorage.setItem('rol', res.rol);
        localStorage.setItem('idusuario', res.idusuario.toString());

       localStorage.setItem('nombre', res.nombres);
localStorage.setItem('correo', this.credentials.correo);

        // redirección por rol
        switch (res.rol) {

          case 'ADMIN':
            this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
            break;

          case 'DOCENTE':
            this.router.navigateByUrl('/docente/dashboard', { replaceUrl: true });
            break;

          case 'COORDINADOR':
            this.router.navigateByUrl('/coordinador/dashboard', { replaceUrl: true });
            break;

          default:
            this.router.navigateByUrl('/', { replaceUrl: true });
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
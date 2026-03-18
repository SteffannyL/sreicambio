import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // 🔥 FALTA ESTO
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, // 🔥 NECESARIO PARA *ngIf
    FormsModule,
    RouterModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  usuario = {
    nombres: '',
    apellidos: '',
    correo: '',
    contrasena: '',
    idtipousuario: 5
  };

  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService) {}

  register() {

    this.error = '';
    this.success = '';
    this.loading = true;

    this.authService.register(this.usuario).subscribe({

      next: () => {

        this.loading = false;

        this.success = 'Usuario creado correctamente';

        this.usuario = {
          nombres: '',
          apellidos: '',
          correo: '',
          contrasena: '',
          idtipousuario: 5
        };

      },

      error: (err) => {

        this.loading = false;

        this.error = err.error?.message || 'Error al registrar';

        console.error(err);

      }

    });
  }
}
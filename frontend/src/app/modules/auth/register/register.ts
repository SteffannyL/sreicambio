import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterModule], // 🔥 IMPORTANTE
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {

  usuario = {
    nombres: '',
    apellidos: '',
    correo: '',
    contrasena: '',
    idtipousuario: 5 // Docente por defecto
  };

  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService) {}

  register() {
    console.log("CLICK FUNCIONANDO"); // 🔎 prueba

    this.error = '';
    this.success = '';
    this.loading = true;

    this.authService.register(this.usuario).subscribe({
      next: (response) => {
        this.success = response.mensaje || 'Usuario registrado';
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Error al registrar';
        this.loading = false;
      }
    });
  }
}
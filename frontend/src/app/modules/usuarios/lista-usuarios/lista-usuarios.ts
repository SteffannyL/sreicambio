import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';  // ← Importa esto
import { UsuarioService } from '../../../core/services/usuario.service';

@Component({
  selector: 'app-lista-usuarios',
  standalone: true,
  imports: [FormsModule],  // ← Agrega aquí
  templateUrl: './lista-usuarios.html'
})
export class ListaUsuariosComponent implements OnInit {

  usuarios: any[] = [];
  nuevoUsuario = {
    nombres: '',
    apellidos: '',
    correo: '',
    contrasena: '',
    idtipousuario: 5
  };

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit() {
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.listarUsuarios().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Error al listar usuarios', err)
    });
  }

  crearUsuario() {
    this.usuarioService.crearUsuario(this.nuevoUsuario).subscribe({
      next: () => {
        alert('Usuario creado con éxito');
        this.cargarUsuarios();
        this.nuevoUsuario = { nombres: '', apellidos: '', correo: '', contrasena: '', idtipousuario: 5 };
      },
      error: (err) => alert('Error: ' + (err.error?.message || 'No autorizado'))
    });
  }
}
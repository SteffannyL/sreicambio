import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { UsuarioAdmin } from '../../core/models/usuario-admin.model';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css']
})
export class EditarUsuarioComponent implements OnInit {

  usuario: UsuarioAdmin = {
    idusuario: 0,
    nombres: '',
    apellidos: '',
    correo: '',
    activo: true,
    tipoUsuario: ''
  };

  id!: number;

  constructor(
    private adminService: AdminService,
    private route: ActivatedRoute,
    private router: Router,              
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.adminService.obtenerUsuarioPorId(this.id)
      .subscribe({
        next: (data) => {
          console.log('Usuario recibido:', data);

          this.usuario = {
            idusuario: data.idusuario,
            nombres: data.nombres,
            apellidos: data.apellidos,
            correo: data.correo,
            activo: data.activo,
            tipoUsuario: data.tipoUsuario
          };

          this.cd.detectChanges(); // 👈 fuerza actualización del formulario
        },
        error: (err) => {
          console.error('Error obteniendo usuario', err);
        }
      });
  }

 guardar() {
  console.log('🔥 BOTÓN GUARDAR PRESIONADO');
  
  this.adminService.actualizarUsuario(this.usuario)
    .subscribe({
      next: (res) => {
        console.log('✅ Respuesta backend:', res);
        this.router.navigate(['/admin/usuarios']);
      },
      error: (err) => {
        console.error('❌ Error backend:', err);
      }
    });
}

  cancelar() {
    this.router.navigate(['/admin/usuarios']);
  }
}

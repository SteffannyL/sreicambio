import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'admin/usuarios',
    pathMatch: 'full'
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/administrador/administrador.component')
        .then(m => m.AdministradorComponent),
    children: [
      {
        path: '',
        redirectTo: 'usuarios',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/administrador/dashboard.component')
            .then(m => m.DashboardComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./features/administrador/usuarios.component')
            .then(m => m.UsuariosComponent)
      },
      {
        path: 'usuarios/editar/:id',
        loadComponent: () =>
          import('./features/administrador/editar-usuario.component')
            .then(m => m.EditarUsuarioComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'admin/usuarios'
  }
];
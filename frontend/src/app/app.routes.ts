import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

import { DocenteComponent } from './features/docente/docente.component';
import { DocenteDashboardComponent } from './features/docente/dashboard/docente-dashboard.component';
import { CoordinadorComponent } from './features/coordinador/coordinador.component';

export const routes: Routes = [

  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  /* ================= AUTH ================= */

  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth-routing-module')
        .then(m => m.AuthRoutes)
  },

  /* ================= DASHBOARD GENERAL ================= */

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },

  /* ================= DOCENTE ================= */

  {
    path: 'docente',
    component: DocenteComponent,
    canActivate: [authGuard],
    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        component: DocenteDashboardComponent
      },

      {
        path: 'crear-evento',
        loadComponent: () =>
          import('./modules/eventos/crear-evento')
            .then(m => m.CrearEventoComponent)
      },

      {
        path: 'mis-eventos',
        loadComponent: () =>
          import('./features/docente/mis-eventos/mis-eventos.component')
            .then(m => m.MisEventosComponent)
      },
      {
  path: 'ia/generar-juego',
  loadComponent: () => import('./modules/ia/generar-juego').then(m => m.GenerarJuegoComponent)
}

    ]
  },

  /* ================= COORDINADOR ================= */

  {
    path: 'coordinador',
    component: CoordinadorComponent,
    canActivate: [authGuard],
    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/coordinador/dashboard/dashboard-coordinador.component')
            .then(m => m.DashboardCoordinadorComponent)
      },

      {
        path: 'aprobar-eventos',
        loadComponent: () =>
          import('./features/coordinador/aprobar-eventos/aprobar-eventos')
            .then(m => m.AprobarEventosComponent)
      }

    ]
  },

  /* ================= ADMIN ================= */

  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/administrador/administrador.component')
        .then(m => m.AdministradorComponent),

    children: [

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

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
      },

      {
        path: 'sesiones',
        loadComponent: () =>
          import('./features/administrador/sesiones/sesiones')
            .then(m => m.SesionesComponent)
      },
       {
      path: 'backups',
      loadComponent: () =>
        import('./features/administrador/backups/backups.component')
          .then(m => m.BackupsComponent)
    }

    ]
  },

  { path: '**', redirectTo: 'auth/login' }

];
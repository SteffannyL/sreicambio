import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  { path: '', redirectTo: 'auth', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./modules/auth/auth-routing-module')
        .then(m => m.AuthRoutes)
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },


  {
  path: 'docente/crear-evento',
  loadComponent: () =>
    import('./modules/eventos/crear-evento')
      .then(m => m.CrearEventoComponent)
},
{
  path: 'coordinador/aprobar-eventos',
  loadComponent: () =>
    import('./modules/coordinador/aprobar-eventos/aprobar-eventos')
      .then(m => m.AprobarEventosComponent)
},
  { path: '**', redirectTo: 'auth' }
];
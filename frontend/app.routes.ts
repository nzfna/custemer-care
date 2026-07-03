import { Routes } from '@angular/router';
import { authGuard, guestGuard, agentGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      { path: 'login',          loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
      { path: 'register',       loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
      { path: 'forgot-password',loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
      { path: 'reset-password', loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ]
  },

  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
  },

  {
    path: 'tickets',
    canActivate: [authGuard],
    children: [
      { path: '',       loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent) },
      { path: 'new',    loadComponent: () => import('./features/tickets/create-ticket/create-ticket.component').then(m => m.CreateTicketComponent) },
      { path: ':id',    loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent) },
    ]
  },

  {
    path: 'agent',
    canActivate: [authGuard, agentGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'tickets',   loadComponent: () => import('./features/tickets/ticket-list/ticket-list.component').then(m => m.TicketListComponent) },
      { path: 'tickets/:id', loadComponent: () => import('./features/tickets/ticket-detail/ticket-detail.component').then(m => m.TicketDetailComponent) },
    ]
  },

  { path: '**', redirectTo: '/auth/login' }
];

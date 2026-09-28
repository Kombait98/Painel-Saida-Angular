import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'portaria', loadComponent: () => import('./pages/portaria/portaria').then(m => m.Portaria) },
  { path: 'sala', loadComponent: () => import('./pages/sala/sala').then(m => m.Sala) },
  { path: '**', redirectTo: '' }
];

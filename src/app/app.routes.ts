import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'cadastro-usuario', loadComponent: () => import('./pages/cadastro-usuario/cadastro-usuario').then(m => m.CadastroUsuario) },
  { path: 'reset-senha', loadComponent: () => import('./pages/reset-senha/reset-senha').then(m => m.ResetSenha) },
  { path: 'gestao', loadComponent: () => import('./pages/gestao-escolar/gestao-escolar').then(m => m.GestaoEscolar) },
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'portaria', loadComponent: () => import('./pages/portaria/portaria').then(m => m.Portaria) },
  { path: 'sala', loadComponent: () => import('./pages/sala/sala').then(m => m.Sala) },
  { path: '**', redirectTo: 'login' }
];

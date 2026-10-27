import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  userId = '';
  senha = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  quickUsers = [
    { label: 'Porteiro', userId: 'porteiro', senha: '123', color: '#DF184F' },
    { label: 'Prof. Turma A', userId: 'prof.a', senha: '123', color: '#58247F' },
    { label: 'Prof. Turma B', userId: 'prof.b', senha: '123', color: '#58247F' },
    { label: 'Prof. Turma C', userId: 'prof.c', senha: '123', color: '#58247F' },
    { label: 'Prof. Turma D', userId: 'prof.d', senha: '123', color: '#58247F' },
    { label: 'Prof. Turma E', userId: 'prof.e', senha: '123', color: '#58247F' }
  ];

  async onSubmit() {
    if (!this.userId.trim() || !this.senha.trim()) {
      this.errorMessage.set('Preencha o usuário e a senha.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    try {
      const user = await this.authService.login(this.userId.trim(), this.senha.trim());
      if (user.tipoPessoaId === 4 || user.tipoPessoaNome === 'Porteiro') {
        this.router.navigate(['/portaria']);
      } else if (user.tipoPessoaId === 3 || user.tipoPessoaNome === 'Professor') {
        this.router.navigate(['/sala']);
      } else {
        this.router.navigate(['/']);
      }
    } catch {
      this.errorMessage.set('Usuário ou senha inválidos, ou API indisponível.');
    } finally {
      this.loading.set(false);
    }
  }

  fillAndLogin(u: { userId: string; senha: string }) {
    this.userId = u.userId;
    this.senha = u.senha;
    this.onSubmit();
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-reset-senha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-senha.html',
  styleUrl: './reset-senha.css'
})
export class ResetSenha {
  private authService = inject(AuthService);

  userId = '';
  cpf = '';
  novaSenha = '';
  confirmarNovaSenha = '';

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  async onSubmit() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.userId.trim() || !this.novaSenha.trim()) {
      this.errorMessage.set('Informe o Usuário (Login) e a Nova Senha.');
      return;
    }

    if (this.novaSenha !== this.confirmarNovaSenha) {
      this.errorMessage.set('A confirmação da nova senha não confere.');
      return;
    }

    this.loading.set(true);

    try {
      const resp = await this.authService.resetSenha({
        userId: this.userId.trim(),
        cpf: this.cpf.trim() || null,
        novaSenha: this.novaSenha
      });

      this.successMessage.set(resp.message);
      this.novaSenha = '';
      this.confirmarNovaSenha = '';
    } catch (err: any) {
      const msg = err?.error?.message || 'Não foi possível redefinir a senha. Verifique o usuário informado.';
      this.errorMessage.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}

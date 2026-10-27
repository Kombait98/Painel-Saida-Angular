import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { StudentService } from '../../services/student';
import { TipoPessoaItem, UsuarioResumo } from '../../models/types';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cadastro-usuario.html',
  styleUrl: './cadastro-usuario.css'
})
export class CadastroUsuario implements OnInit {
  private authService = inject(AuthService);
  private studentService = inject(StudentService);

  classes = this.studentService.classes;
  tiposPessoa = signal<TipoPessoaItem[]>([
    { id: 3, nome: 'Professor' },
    { id: 4, nome: 'Porteiro' },
    { id: 5, nome: 'Administrador' },
    { id: 2, nome: 'Responsavel' }
  ]);
  usuarios = signal<UsuarioResumo[]>([]);

  editandoUsuarioId = signal<number | null>(null);
  nomeCompleto = '';
  cpf = '';
  dataNascimento = '';
  telefone = '';
  tipoPessoaId = 3; // Professor padrão
  turmaId: number | null = null;
  userId = '';
  senha = '';
  confirmarSenha = '';

  loading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  private feedbackTimer: any = null;

  async ngOnInit() {
    await this.carregarDados();
  }

  mostrarSucesso(msg: string) {
    this.errorMessage.set(null);
    this.successMessage.set(msg);
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      this.successMessage.set(null);
    }, 5000);
  }

  mostrarErro(msg: string) {
    this.successMessage.set(null);
    this.errorMessage.set(msg);
    if (this.feedbackTimer) clearTimeout(this.feedbackTimer);
    this.feedbackTimer = setTimeout(() => {
      this.errorMessage.set(null);
    }, 6000);
  }

  fecharAvisos() {
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  async carregarDados() {
    try {
      const [tipos, listaUsuarios] = await Promise.all([
        this.authService.getTiposPessoa(),
        this.authService.getUsuarios()
      ]);
      this.tiposPessoa.set(tipos.filter(t => t.id !== 1));
      this.usuarios.set(listaUsuarios);
    } catch {
      // mantém lista padrão se falhar
    }
  }

  iniciarEdicaoUsuario(u: UsuarioResumo) {
    this.fecharAvisos();
    this.editandoUsuarioId.set(u.pessoaId);
    this.nomeCompleto = u.nomeCompleto;
    this.cpf = u.cpf || '';
    this.telefone = u.telefone || '';
    this.tipoPessoaId = u.tipoPessoaId;
    this.turmaId = u.turmaId ?? null;
    this.userId = u.userId;
    this.senha = '';
    this.confirmarSenha = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicaoUsuario() {
    this.editandoUsuarioId.set(null);
    this.nomeCompleto = '';
    this.cpf = '';
    this.dataNascimento = '';
    this.telefone = '';
    this.userId = '';
    this.senha = '';
    this.confirmarSenha = '';
    this.turmaId = null;
  }

  async onSubmit() {
    this.fecharAvisos();

    const idEdicao = this.editandoUsuarioId();

    if (!this.nomeCompleto.trim() || !this.userId.trim() || (!idEdicao && !this.senha.trim())) {
      this.mostrarErro(
        idEdicao
          ? 'Preencha Nome Completo e Usuário (Login).'
          : 'Preencha Nome Completo, Usuário (Login) e Senha.'
      );
      return;
    }

    if (this.senha && this.senha !== this.confirmarSenha) {
      this.mostrarErro('A confirmação de senha não confere.');
      return;
    }

    this.loading.set(true);

    try {
      const payload = {
        nomeCompleto: this.nomeCompleto.trim(),
        cpf: this.cpf.trim() || null,
        dataNascimento: this.dataNascimento ? new Date(this.dataNascimento).toISOString() : null,
        telefone: this.telefone.trim() || null,
        tipoPessoaId: Number(this.tipoPessoaId),
        userId: this.userId.trim(),
        senha: this.senha,
        turmaId: Number(this.tipoPessoaId) === 3 && this.turmaId ? Number(this.turmaId) : null
      };

      if (idEdicao) {
        const atualizado = await this.authService.atualizarUsuario(idEdicao, payload);
        this.mostrarSucesso(`Edição realizada! Os dados de "${atualizado.nomeCompleto}" (${atualizado.userId}) foram atualizados.`);
      } else {
        const novo = await this.authService.registrarUsuario(payload);
        this.mostrarSucesso(`Cadastro realizado! Usuário "${novo.nomeCompleto}" (${novo.userId}) cadastrado com sucesso!`);
      }

      this.cancelarEdicaoUsuario();
      await this.carregarDados();
      await this.studentService.loadClasses();
    } catch (err: any) {
      const msg = err?.error?.message || 'Ocorreu um erro ao salvar o usuário no banco de dados.';
      this.mostrarErro(msg);
    } finally {
      this.loading.set(false);
    }
  }
}

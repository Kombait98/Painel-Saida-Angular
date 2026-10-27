import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService } from '../../services/student';
import {
  AlunoCadastroResumo,
  AlunoResponsavelDetalhe,
  ClassRoom,
  PessoaResponsavelItem,
  ProfessorItem,
  TipoVinculoItem,
  TurnoItem
} from '../../models/types';

@Component({
  selector: 'app-gestao-escolar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestao-escolar.html',
  styleUrl: './gestao-escolar.css'
})
export class GestaoEscolar implements OnInit {
  private studentService = inject(StudentService);

  abaAtiva = signal<'ALUNOS' | 'TURMAS'>('ALUNOS');

  classes = this.studentService.classes;
  turnos = signal<TurnoItem[]>([]);
  professores = signal<ProfessorItem[]>([]);
  tiposVinculo = signal<TipoVinculoItem[]>([]);
  pessoasResponsaveis = signal<PessoaResponsavelItem[]>([]);
  alunosLista = signal<AlunoCadastroResumo[]>([]);

  // Filtros de Alunos
  filtroTurmaId = signal<string>('');
  filtroBusca = signal<string>('');

  alunosFiltrados = computed(() => {
    const turmaId = this.filtroTurmaId();
    const busca = this.filtroBusca().toLowerCase().trim();
    return this.alunosLista().filter(a => {
      const matchTurma = !turmaId || a.turmaId.toString() === turmaId;
      const matchBusca =
        !busca ||
        a.nomeCompleto.toLowerCase().includes(busca) ||
        a.matricula.toLowerCase().includes(busca) ||
        (a.nomeResponsavel && a.nomeResponsavel.toLowerCase().includes(busca));
      return matchTurma && matchBusca;
    });
  });

  // Formulário de Turma
  editandoTurmaId = signal<number | null>(null);
  turmaNome = '';
  turmaSala = '';
  turmaAnoLetivo = 2026;
  turmaTurnoId = 1;
  turmaProfessorPessoaId: number | null = null;

  // Formulário de Aluno
  editandoAlunoId = signal<number | null>(null);
  alunoNomeCompleto = '';
  alunoMatricula = '';
  alunoTurmaId: number = 1;
  alunoCpf = '';
  alunoDataNascimento = '';
  alunoPodeSairSozinho = false;
  alunoObservacaoPortaria = '';
  alunoNomeResponsavel = '';
  alunoTelefoneResponsavel = '';
  alunoTipoVinculoId: number = 2;

  // Modal de Vínculo Aluno <-> Responsáveis (1:N na tabela aluno_responsavel)
  alunoSelecionadoModal = signal<AlunoCadastroResumo | null>(null);
  modoResponsavel: 'NOVO' | 'EXISTENTE' = 'NOVO';
  vincResponsavelPessoaId: number | null = null;
  vincNomeCompleto = '';
  vincCpf = '';
  vincTelefone = '';
  vincTipoVinculoId = 1; // Mãe
  vincResponsavelPrincipal = false;
  vincPodeRetirar = true;
  vincDataValidade = '';

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
      const [turnos, profs, vinculos, alunos, pessoasResp] = await Promise.all([
        this.studentService.getTurnos(),
        this.studentService.getProfessores(),
        this.studentService.getTiposVinculo(),
        this.studentService.getAlunosCadastro(),
        this.studentService.getPessoasResponsaveis()
      ]);
      this.turnos.set(turnos);
      this.professores.set(profs);
      this.tiposVinculo.set(vinculos);
      this.alunosLista.set(alunos);
      this.pessoasResponsaveis.set(pessoasResp);

      const modalAtual = this.alunoSelecionadoModal();
      if (modalAtual) {
        const atualizado = alunos.find(a => a.alunoId === modalAtual.alunoId) || null;
        this.alunoSelecionadoModal.set(atualizado);
      }

      const listaTurmas = this.classes();
      if (listaTurmas.length > 0 && !this.alunoTurmaId) {
        this.alunoTurmaId = Number(listaTurmas[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar dados de gestão escolar:', err);
      this.mostrarErro('Não foi possível carregar os dados do servidor.');
    }
  }

  selecionarAba(aba: 'ALUNOS' | 'TURMAS') {
    this.abaAtiva.set(aba);
    this.fecharAvisos();
  }

  // ==========================================================================
  // Ações de Turma
  // ==========================================================================

  iniciarEdicaoTurma(turma: ClassRoom) {
    this.fecharAvisos();
    this.editandoTurmaId.set(Number(turma.id));
    this.turmaNome = turma.name;
    this.turmaSala = turma.sala || '';
    this.turmaAnoLetivo = turma.anoLetivo || 2026;
    this.turmaTurnoId = turma.turnoId || 1;
    this.turmaProfessorPessoaId = turma.professorPessoaId ?? null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicaoTurma() {
    this.editandoTurmaId.set(null);
    this.turmaNome = '';
    this.turmaSala = '';
    this.turmaAnoLetivo = 2026;
    this.turmaTurnoId = 1;
    this.turmaProfessorPessoaId = null;
  }

  async salvarTurma() {
    this.fecharAvisos();

    if (!this.turmaNome.trim()) {
      this.mostrarErro('Informe o nome da turma para continuar.');
      return;
    }

    this.loading.set(true);
    try {
      const payload = {
        nome: this.turmaNome.trim(),
        anoLetivo: Number(this.turmaAnoLetivo) || 2026,
        turnoId: Number(this.turmaTurnoId) || 1,
        professorPessoaId: this.turmaProfessorPessoaId ? Number(this.turmaProfessorPessoaId) : null,
        sala: this.turmaSala.trim() || null
      };

      const idEdicao = this.editandoTurmaId();
      if (idEdicao) {
        await this.studentService.atualizarTurma(idEdicao, payload);
        this.mostrarSucesso(`Edição realizada! Os dados da turma "${payload.nome}" foram atualizados com sucesso.`);
      } else {
        await this.studentService.criarTurma(payload);
        this.mostrarSucesso(`Cadastro realizado! A turma "${payload.nome}" foi criada com sucesso.`);
      }

      this.cancelarEdicaoTurma();
      await this.carregarDados();
    } catch (err: any) {
      this.mostrarErro(err?.error?.message || 'Ocorreu um erro ao salvar a turma no banco de dados.');
    } finally {
      this.loading.set(false);
    }
  }

  async removerTurma(turma: ClassRoom) {
    this.fecharAvisos();
    try {
      await this.studentService.excluirTurma(Number(turma.id));
      this.mostrarSucesso(`Turma "${turma.name}" excluída com sucesso.`);
      await this.carregarDados();
    } catch (err: any) {
      this.mostrarErro(err?.error?.message || 'Ocorreu um erro ao remover a turma.');
    }
  }

  // ==========================================================================
  // Ações de Aluno
  // ==========================================================================

  iniciarEdicaoAluno(aluno: AlunoCadastroResumo) {
    this.fecharAvisos();
    this.editandoAlunoId.set(aluno.alunoId);
    this.alunoNomeCompleto = aluno.nomeCompleto;
    this.alunoMatricula = aluno.matricula;
    this.alunoTurmaId = aluno.turmaId;
    this.alunoCpf = aluno.cpf || '';
    this.alunoDataNascimento = aluno.dataNascimento ? aluno.dataNascimento.substring(0, 10) : '';
    this.alunoPodeSairSozinho = aluno.podeSairSozinho;
    this.alunoObservacaoPortaria = aluno.observacaoPortaria || '';
    this.alunoNomeResponsavel = aluno.nomeResponsavel || '';
    this.alunoTelefoneResponsavel = aluno.telefoneResponsavel || '';
    this.alunoTipoVinculoId = aluno.tipoVinculoId || 2;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicaoAluno() {
    this.editandoAlunoId.set(null);
    this.alunoNomeCompleto = '';
    this.alunoMatricula = '';
    this.alunoCpf = '';
    this.alunoDataNascimento = '';
    this.alunoPodeSairSozinho = false;
    this.alunoObservacaoPortaria = '';
    this.alunoNomeResponsavel = '';
    this.alunoTelefoneResponsavel = '';
    this.alunoTipoVinculoId = 2;
  }

  async salvarAluno() {
    this.fecharAvisos();

    if (!this.alunoNomeCompleto.trim() || !this.alunoMatricula.trim() || !this.alunoTurmaId) {
      this.mostrarErro('Preencha Nome Completo, Matrícula e selecione a Turma.');
      return;
    }

    this.loading.set(true);
    try {
      const payload = {
        nomeCompleto: this.alunoNomeCompleto.trim(),
        cpf: this.alunoCpf.trim() || null,
        dataNascimento: this.alunoDataNascimento ? new Date(this.alunoDataNascimento).toISOString() : null,
        matricula: this.alunoMatricula.trim(),
        turmaId: Number(this.alunoTurmaId),
        podeSairSozinho: this.alunoPodeSairSozinho,
        observacaoPortaria: this.alunoObservacaoPortaria.trim() || null,
        nomeResponsavel: this.alunoNomeResponsavel.trim() || null,
        telefoneResponsavel: this.alunoTelefoneResponsavel.trim() || null,
        tipoVinculoId: this.alunoTipoVinculoId ? Number(this.alunoTipoVinculoId) : null
      };

      const idEdicao = this.editandoAlunoId();
      if (idEdicao) {
        await this.studentService.atualizarAluno(idEdicao, payload);
        this.mostrarSucesso(`Edição realizada! Os dados do aluno "${payload.nomeCompleto}" foram salvos com sucesso.`);
      } else {
        await this.studentService.criarAluno(payload);
        this.mostrarSucesso(`Cadastro realizado! O aluno "${payload.nomeCompleto}" foi cadastrado com sucesso.`);
      }

      this.cancelarEdicaoAluno();
      await this.carregarDados();
    } catch (err: any) {
      this.mostrarErro(err?.error?.message || 'Ocorreu um erro ao salvar o aluno no banco de dados.');
    } finally {
      this.loading.set(false);
    }
  }

  async removerAluno(aluno: AlunoCadastroResumo) {
    this.fecharAvisos();
    try {
      await this.studentService.excluirAluno(aluno.alunoId);
      this.mostrarSucesso(`Aluno "${aluno.nomeCompleto}" removido com sucesso.`);
      await this.carregarDados();
    } catch (err: any) {
      this.mostrarErro(err?.error?.message || 'Ocorreu um erro ao remover o aluno.');
    }
  }

  // ==========================================================================
  // Gestão de Vínculos Aluno <-> Responsável (aluno_responsavel)
  // ==========================================================================

  abrirModalResponsaveis(aluno: AlunoCadastroResumo) {
    this.fecharAvisos();
    this.alunoSelecionadoModal.set(aluno);
    this.modoResponsavel = 'NOVO';
    this.vincResponsavelPessoaId = null;
    this.vincNomeCompleto = '';
    this.vincCpf = '';
    this.vincTelefone = '';
    this.vincTipoVinculoId = 1;
    this.vincResponsavelPrincipal = aluno.responsaveis.length === 0;
    this.vincPodeRetirar = true;
    this.vincDataValidade = '';
  }

  fecharModalResponsaveis() {
    this.alunoSelecionadoModal.set(null);
  }

  async salvarVinculoResponsavel() {
    const aluno = this.alunoSelecionadoModal();
    if (!aluno) return;

    this.fecharAvisos();

    if (this.modoResponsavel === 'EXISTENTE' && !this.vincResponsavelPessoaId) {
      this.mostrarErro('Selecione um responsável já cadastrado na lista.');
      return;
    }

    if (this.modoResponsavel === 'NOVO' && !this.vincNomeCompleto.trim()) {
      this.mostrarErro('Informe o nome completo do responsável.');
      return;
    }

    this.loading.set(true);
    try {
      await this.studentService.vincularResponsavelAoAluno(aluno.alunoId, {
        responsavelPessoaId: this.modoResponsavel === 'EXISTENTE' ? Number(this.vincResponsavelPessoaId) : null,
        nomeCompleto: this.modoResponsavel === 'NOVO' ? this.vincNomeCompleto.trim() : null,
        cpf: this.modoResponsavel === 'NOVO' ? (this.vincCpf.trim() || null) : null,
        telefone: this.modoResponsavel === 'NOVO' ? (this.vincTelefone.trim() || null) : null,
        tipoVinculoId: Number(this.vincTipoVinculoId) || 1,
        responsavelPrincipal: this.vincResponsavelPrincipal,
        podeRetirar: this.vincPodeRetirar,
        dataValidade: this.vincDataValidade ? new Date(this.vincDataValidade).toISOString() : null
      });

      this.vincNomeCompleto = '';
      this.vincCpf = '';
      this.vincTelefone = '';
      this.vincDataValidade = '';
      this.vincResponsavelPrincipal = false;

      await this.carregarDados();
      this.mostrarSucesso('Responsável vinculado ao aluno com sucesso!');
    } catch (err: any) {
      this.mostrarErro(err?.error?.message || 'Erro ao vincular responsável ao aluno.');
    } finally {
      this.loading.set(false);
    }
  }

  async togglePodeRetirar(resp: AlunoResponsavelDetalhe) {
    try {
      await this.studentService.alternarPermissaoRetirada(resp.id);
      await this.carregarDados();
      this.mostrarSucesso(`Permissão de retirada de "${resp.nomeResponsavel}" atualizada!`);
    } catch {
      this.mostrarErro('Não foi possível alterar a permissão de retirada.');
    }
  }

  async removerVinculo(resp: AlunoResponsavelDetalhe) {
    try {
      await this.studentService.removerVinculoResponsavel(resp.id);
      await this.carregarDados();
      this.mostrarSucesso(`Vínculo de "${resp.nomeResponsavel}" removido com sucesso.`);
    } catch {
      this.mostrarErro('Não foi possível remover o vínculo do responsável.');
    }
  }
}

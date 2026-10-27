import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import {
  AlunoCadastroResumo,
  AlunoResponsavelDetalhe,
  ClassRoom,
  HistoricoItem,
  PessoaResponsavelItem,
  ProfessorItem,
  SalvarAlunoPayload,
  SalvarTurmaPayload,
  Student,
  StudentStatus,
  TipoVinculoItem,
  TurnoItem,
  VincularResponsavelPayload
} from '../models/types';
import { AuthService } from './auth';
import { environment } from '../../environments/environment';

interface ApiTurma {
  id: number;
  nome: string;
  anoLetivo: number;
  turnoId: number;
  turno?: { id: number; nome: string };
  professorPessoaId?: number | null;
  professorPessoa?: { id: number; nomeCompleto: string };
  sala?: string;
}

interface ApiPainelAluno {
  alunoId: number;
  matricula: string;
  nomeAluno: string;
  turmaId: number;
  nomeTurma: string;
  sala?: string;
  podeSairSozinho: boolean;
  observacaoPortaria?: string;
  solicitacaoSaidaId?: number | null;
  statusId: number;
  statusNome: string;
  lastUpdatedAt: number;
  responsavelSolicitacaoId?: number | null;
  nomeResponsavel?: string | null;
  responsaveis?: AlunoResponsavelDetalhe[];
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;
  private channel = new BroadcastChannel('school_dismissal');

  public classes = signal<ClassRoom[]>([]);
  public students = signal<Student[]>([]);
  public loading = signal<boolean>(false);

  constructor() {
    this.loadInitialData();

    this.channel.onmessage = (event) => {
      if (event.data?.type === 'REFRESH_FROM_API') {
        this.loadClasses();
        this.loadStudents();
      } else if (event.data?.type === 'SYNC_STUDENTS' && event.data.payload) {
        this.students.set(event.data.payload);
      }
    };

    setInterval(() => {
      this.loadStudents();
    }, 3000);
  }

  async loadInitialData() {
    this.loading.set(true);
    try {
      await Promise.all([this.loadClasses(), this.loadStudents()]);
    } finally {
      this.loading.set(false);
    }
  }

  async loadClasses() {
    try {
      const turmas = await firstValueFrom(
        this.http.get<ApiTurma[]>(`${this.apiUrl}/turmas`)
      );
      this.classes.set(
        turmas.map(t => ({
          id: t.id.toString(),
          name: t.nome,
          sala: t.sala,
          anoLetivo: t.anoLetivo,
          turnoId: t.turnoId,
          turnoNome: t.turno?.nome,
          professorPessoaId: t.professorPessoaId ?? null,
          professorNome: t.professorPessoa?.nomeCompleto
        }))
      );
    } catch (err) {
      console.error('Erro ao carregar turmas da API:', err);
    }
  }

  async loadStudents() {
    try {
      const data = await firstValueFrom(
        this.http.get<ApiPainelAluno[]>(`${this.apiUrl}/turmas/painel-alunos`)
      );
      this.students.set(
        data.map(item => ({
          id: item.alunoId.toString(),
          alunoId: item.alunoId,
          matricula: item.matricula,
          name: item.nomeAluno,
          classId: item.turmaId.toString(),
          nomeTurma: item.nomeTurma,
          sala: item.sala,
          podeSairSozinho: item.podeSairSozinho,
          observacaoPortaria: item.observacaoPortaria,
          solicitacaoSaidaId: item.solicitacaoSaidaId,
          statusId: item.statusId,
          status: this.mapStatusIdToEnum(item.statusId),
          lastUpdatedAt: item.lastUpdatedAt,
          responsavelSolicitacaoId: item.responsavelSolicitacaoId,
          nomeResponsavel: item.nomeResponsavel,
          responsaveis: item.responsaveis ?? []
        }))
      );
    } catch (err) {
      console.error('Erro ao carregar alunos da API:', err);
    }
  }

  private mapStatusIdToEnum(statusId: number): StudentStatus {
    switch (statusId) {
      case 1:
        return 'CHAMADO';
      case 2:
        return 'SE_ARRUMANDO';
      case 3:
        return 'A_CAMINHO';
      case 4:
        return 'ENTREGUE';
      default:
        return 'NA_SALA';
    }
  }

  private mapEnumToStatusId(status: StudentStatus): number {
    switch (status) {
      case 'CHAMADO':
        return 1;
      case 'SE_ARRUMANDO':
        return 2;
      case 'A_CAMINHO':
        return 3;
      case 'ENTREGUE':
        return 4;
      default:
        return 0;
    }
  }

  async updateStudentStatus(
    studentId: string,
    status: StudentStatus,
    observacao?: string,
    responsavelPessoaId?: number | null
  ) {
    const student = this.students().find(s => s.id === studentId);
    if (!student) return;

    const currentUser = this.authService.currentUser();

    try {
      if (status === 'CHAMADO') {
        await firstValueFrom(
          this.http.post(`${this.apiUrl}/solicitacoessaida`, {
            alunoId: student.alunoId,
            responsavelPessoaId: responsavelPessoaId ?? null,
            porteiroPessoaId: currentUser?.pessoaId ?? 1,
            observacao: observacao ?? 'Porteiro solicitou o aluno na portaria'
          })
        );
      } else if (student.solicitacaoSaidaId) {
        const novoStatusId = this.mapEnumToStatusId(status);
        await firstValueFrom(
          this.http.patch(`${this.apiUrl}/solicitacoessaida/${student.solicitacaoSaidaId}/status`, {
            statusId: novoStatusId,
            usuarioPessoaId: currentUser?.pessoaId ?? null,
            alteradoPorUserId: currentUser?.userId ?? null,
            observacao: observacao ?? `Status alterado para ${status}`,
            responsavelPessoaId: responsavelPessoaId ?? null
          })
        );
      }

      await this.loadStudents();
      this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    } catch (err) {
      console.error('Erro ao atualizar status na API:', err);
    }
  }

  async getHistorico(solicitacaoSaidaId: number): Promise<HistoricoItem[]> {
    return firstValueFrom(
      this.http.get<HistoricoItem[]>(`${this.apiUrl}/solicitacoessaida/${solicitacaoSaidaId}/historico`)
    );
  }

  async resetAllSolicitacoes() {
    await firstValueFrom(this.http.post(`${this.apiUrl}/solicitacoessaida/reset`, {}));
    await this.loadStudents();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
  }

  // ==========================================================================
  // CRUD de Turmas, Alunos e Vínculos de Responsáveis
  // ==========================================================================

  async getTurnos(): Promise<TurnoItem[]> {
    return firstValueFrom(this.http.get<TurnoItem[]>(`${this.apiUrl}/turmas/turnos`));
  }

  async getProfessores(): Promise<ProfessorItem[]> {
    return firstValueFrom(this.http.get<ProfessorItem[]>(`${this.apiUrl}/turmas/professores`));
  }

  async criarTurma(payload: SalvarTurmaPayload) {
    const res = await firstValueFrom(this.http.post(`${this.apiUrl}/turmas`, payload));
    await this.loadClasses();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    return res;
  }

  async atualizarTurma(id: number, payload: SalvarTurmaPayload) {
    const res = await firstValueFrom(this.http.put(`${this.apiUrl}/turmas/${id}`, payload));
    await this.loadClasses();
    await this.loadStudents();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    return res;
  }

  async excluirTurma(id: number) {
    const res = await firstValueFrom(this.http.delete(`${this.apiUrl}/turmas/${id}`));
    await this.loadClasses();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    return res;
  }

  async getAlunosCadastro(turmaId?: number | null): Promise<AlunoCadastroResumo[]> {
    const query = turmaId ? `?turmaId=${turmaId}` : '';
    return firstValueFrom(this.http.get<AlunoCadastroResumo[]>(`${this.apiUrl}/alunos${query}`));
  }

  async getTiposVinculo(): Promise<TipoVinculoItem[]> {
    return firstValueFrom(this.http.get<TipoVinculoItem[]>(`${this.apiUrl}/alunos/tipos-vinculo`));
  }

  async getPessoasResponsaveis(): Promise<PessoaResponsavelItem[]> {
    return firstValueFrom(this.http.get<PessoaResponsavelItem[]>(`${this.apiUrl}/alunos/responsaveis-pessoas`));
  }

  async criarAluno(payload: SalvarAlunoPayload) {
    const res = await firstValueFrom(this.http.post(`${this.apiUrl}/alunos`, payload));
    await this.loadStudents();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    return res;
  }

  async atualizarAluno(id: number, payload: SalvarAlunoPayload) {
    const res = await firstValueFrom(this.http.put(`${this.apiUrl}/alunos/${id}`, payload));
    await this.loadStudents();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    return res;
  }

  async excluirAluno(id: number) {
    const res = await firstValueFrom(this.http.delete(`${this.apiUrl}/alunos/${id}`));
    await this.loadStudents();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    return res;
  }

  async vincularResponsavelAoAluno(alunoId: number, payload: VincularResponsavelPayload) {
    const res = await firstValueFrom(
      this.http.post(`${this.apiUrl}/alunos/${alunoId}/responsaveis`, payload)
    );
    await this.loadStudents();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    return res;
  }

  async alternarPermissaoRetirada(vinculoId: number) {
    const res = await firstValueFrom(
      this.http.patch(`${this.apiUrl}/alunos/responsaveis/${vinculoId}/toggle-retirar`, {})
    );
    await this.loadStudents();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    return res;
  }

  async removerVinculoResponsavel(vinculoId: number) {
    const res = await firstValueFrom(
      this.http.delete(`${this.apiUrl}/alunos/responsaveis/${vinculoId}`)
    );
    await this.loadStudents();
    this.channel.postMessage({ type: 'REFRESH_FROM_API' });
    return res;
  }
}

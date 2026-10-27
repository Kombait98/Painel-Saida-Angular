export type StudentStatus = 'NA_SALA' | 'CHAMADO' | 'SE_ARRUMANDO' | 'A_CAMINHO' | 'ENTREGUE';

export interface AlunoResponsavelDetalhe {
  id: number;
  alunoId: number;
  responsavelPessoaId: number;
  nomeResponsavel: string;
  cpfResponsavel?: string | null;
  telefoneResponsavel?: string | null;
  tipoVinculoId: number;
  tipoVinculoNome: string;
  responsavelPrincipal: boolean;
  podeRetirar: boolean;
  dataValidade?: string | null;
}

export interface VincularResponsavelPayload {
  responsavelPessoaId?: number | null;
  nomeCompleto?: string | null;
  cpf?: string | null;
  telefone?: string | null;
  tipoVinculoId: number;
  responsavelPrincipal: boolean;
  podeRetirar: boolean;
  dataValidade?: string | null;
}

export interface PessoaResponsavelItem {
  id: number;
  nomeCompleto: string;
  cpf?: string | null;
  telefone?: string | null;
}

export interface Student {
  id: string;
  alunoId: number;
  matricula: string;
  name: string;
  classId: string;
  nomeTurma?: string;
  sala?: string;
  podeSairSozinho?: boolean;
  observacaoPortaria?: string;
  solicitacaoSaidaId?: number | null;
  statusId: number;
  status: StudentStatus;
  lastUpdatedAt: number;
  responsavelSolicitacaoId?: number | null;
  nomeResponsavel?: string | null;
  responsaveis: AlunoResponsavelDetalhe[];
}

export interface ClassRoom {
  id: string;
  name: string;
  sala?: string;
  anoLetivo?: number;
  turnoId?: number;
  turnoNome?: string;
  professorPessoaId?: number | null;
  professorNome?: string;
}

export interface TurnoItem {
  id: number;
  nome: string;
}

export interface ProfessorItem {
  id: number;
  nomeCompleto: string;
  userId?: string;
}

export interface TipoVinculoItem {
  id: number;
  nome: string;
}

export interface SalvarTurmaPayload {
  nome: string;
  anoLetivo: number;
  turnoId: number;
  professorPessoaId?: number | null;
  sala?: string | null;
}

export interface AlunoCadastroResumo {
  alunoId: number;
  pessoaId: number;
  nomeCompleto: string;
  cpf?: string | null;
  dataNascimento?: string | null;
  matricula: string;
  turmaId: number;
  nomeTurma: string;
  sala?: string | null;
  podeSairSozinho: boolean;
  observacaoPortaria?: string | null;
  nomeResponsavel?: string | null;
  telefoneResponsavel?: string | null;
  tipoVinculoId?: number | null;
  tipoVinculoNome?: string | null;
  responsaveis: AlunoResponsavelDetalhe[];
}

export interface SalvarAlunoPayload {
  nomeCompleto: string;
  cpf?: string | null;
  dataNascimento?: string | null;
  matricula: string;
  turmaId: number;
  podeSairSozinho: boolean;
  observacaoPortaria?: string | null;
  nomeResponsavel?: string | null;
  telefoneResponsavel?: string | null;
  tipoVinculoId?: number | null;
}

export interface AuthUser {
  pessoaId: number;
  userId: string;
  nomeCompleto: string;
  tipoPessoaId: number;
  tipoPessoaNome: string;
  turmaId?: number | null;
}

export interface TipoPessoaItem {
  id: number;
  nome: string;
}

export interface RegistrarUsuarioPayload {
  nomeCompleto: string;
  cpf?: string | null;
  dataNascimento?: string | null;
  telefone?: string | null;
  tipoPessoaId: number;
  userId: string;
  senha: string;
  turmaId?: number | null;
}

export interface ResetSenhaPayload {
  userId: string;
  cpf?: string | null;
  novaSenha: string;
}

export interface UsuarioResumo {
  pessoaId: number;
  nomeCompleto: string;
  cpf?: string | null;
  telefone?: string | null;
  userId: string;
  tipoPessoaId: number;
  tipoPessoaNome: string;
  turmaId?: number | null;
  nomeTurma?: string | null;
}

export interface HistoricoItem {
  id: number;
  solicitacaoSaidaId: number;
  statusId: number;
  status?: { id: number; nome: string };
  dataHora: string;
  alteradoPorUserId?: string;
  observacao?: string;
}

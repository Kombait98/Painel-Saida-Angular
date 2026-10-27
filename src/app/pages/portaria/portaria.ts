import { Component, computed, inject, signal } from '@angular/core';
import { StudentService } from '../../services/student';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { HistoricoItem, Student } from '../../models/types';

@Component({
  selector: 'app-portaria',
  standalone: true,
  imports: [CommonModule, FormsModule, TimeAgoPipe],
  templateUrl: './portaria.html',
  styleUrl: './portaria.css'
})
export class Portaria {
  studentService = inject(StudentService);

  classes = this.studentService.classes;
  selectedClassId = signal<string | null>(null);

  // Guarda o ResponsavelPessoaId selecionado na Portaria por alunoId
  selectedResponsavelPorAluno: Record<string, number | null> = {};

  historicoModalStudent = signal<Student | null>(null);
  historicoItems = signal<HistoricoItem[]>([]);

  students = computed(() => {
    const classId = this.selectedClassId();
    if (!classId) return [];
    return this.studentService.students().filter(s => s.classId === classId && s.status !== 'ENTREGUE');
  });

  selectClass(classId: string) {
    this.selectedClassId.set(classId);
  }

  getResponsavelSelecionado(student: Student): number | null {
    if (this.selectedResponsavelPorAluno[student.id] !== undefined) {
      return this.selectedResponsavelPorAluno[student.id];
    }
    if (student.responsavelSolicitacaoId) {
      return student.responsavelSolicitacaoId;
    }
    const principal = student.responsaveis?.find(r => r.podeRetirar && r.responsavelPrincipal)
                      ?? student.responsaveis?.find(r => r.podeRetirar);
    return principal ? principal.responsavelPessoaId : null;
  }

  setResponsavelSelecionado(studentId: string, responsavelPessoaId: number | null) {
    this.selectedResponsavelPorAluno[studentId] = responsavelPessoaId;
  }

  callStudent(studentOrId: Student | string) {
    const student = typeof studentOrId === 'string'
      ? this.students().find(s => s.id === studentOrId)
      : studentOrId;
    if (!student) return;

    const respId = this.getResponsavelSelecionado(student);
    const respObj = student.responsaveis?.find(r => r.responsavelPessoaId === Number(respId));
    const obs = respObj
      ? `Porteiro chamou o aluno para retirada por ${respObj.nomeResponsavel} (${respObj.tipoVinculoNome})`
      : 'Porteiro solicitou encaminhamento do aluno';

    this.studentService.updateStudentStatus(student.id, 'CHAMADO', obs, respId ? Number(respId) : null);
  }

  markAsDelivered(studentOrId: Student | string) {
    const student = typeof studentOrId === 'string'
      ? this.students().find(s => s.id === studentOrId)
      : studentOrId;
    if (!student) return;

    const respId = this.getResponsavelSelecionado(student);
    const respObj = student.responsaveis?.find(r => r.responsavelPessoaId === Number(respId));
    const obs = respObj
      ? `Entregue na portaria ao responsável: ${respObj.nomeResponsavel} (${respObj.tipoVinculoNome})`
      : 'Porteiro validou a entrega ao responsável';

    this.studentService.updateStudentStatus(student.id, 'ENTREGUE', obs, respId ? Number(respId) : null);
  }

  async openHistorico(student: Student) {
    if (!student.solicitacaoSaidaId) return;
    this.historicoModalStudent.set(student);
    const items = await this.studentService.getHistorico(student.solicitacaoSaidaId);
    this.historicoItems.set(items);
  }

  closeHistorico() {
    this.historicoModalStudent.set(null);
    this.historicoItems.set([]);
  }

  async resetAll() {
    await this.studentService.resetAllSolicitacoes();
  }
}

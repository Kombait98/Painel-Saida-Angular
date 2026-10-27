import { Component, computed, effect, inject, signal } from '@angular/core';
import { StudentService } from '../../services/student';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-sala',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './sala.html',
  styleUrl: './sala.css'
})
export class Sala {
  studentService = inject(StudentService);
  authService = inject(AuthService);

  classes = this.studentService.classes;
  selectedClassId = signal<string | null>(null);

  constructor() {
    // Se o professor logado tiver uma turma vinculada no banco, seleciona automaticamente
    effect(() => {
      const user = this.authService.currentUser();
      if (user?.turmaId && !this.selectedClassId()) {
        this.selectedClassId.set(user.turmaId.toString());
      }
    });
  }

  students = computed(() => {
    const classId = this.selectedClassId();
    if (!classId) return [];
    return this.studentService.students().filter(s => s.classId === classId && s.status !== 'ENTREGUE');
  });

  selectClass(classId: string) {
    this.selectedClassId.set(classId);
  }

  updateStatus(studentId: string, newStatus: 'SE_ARRUMANDO' | 'A_CAMINHO') {
    const obs = newStatus === 'SE_ARRUMANDO'
      ? 'Professor informou que o aluno está se arrumando'
      : 'Professor liberou o aluno para a portaria';
    this.studentService.updateStudentStatus(studentId, newStatus, obs);
  }
}

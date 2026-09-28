import { Component, computed, inject, signal } from '@angular/core';
import { StudentService } from '../../services/student';
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
  
  classes = this.studentService.classes;
  selectedClassId = signal<string | null>(null);

  students = computed(() => {
    const classId = this.selectedClassId();
    if (!classId) return [];
    return this.studentService.students().filter(s => s.classId === classId && s.status !== 'ENTREGUE');
  });

  selectClass(classId: string) {
    this.selectedClassId.set(classId);
  }

  updateStatus(studentId: string, newStatus: 'SE_ARRUMANDO' | 'A_CAMINHO') {
    this.studentService.updateStudentStatus(studentId, newStatus);
  }
}

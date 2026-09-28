import { Component, computed, inject, signal } from '@angular/core';
import { StudentService } from '../../services/student';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

@Component({
  selector: 'app-portaria',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe],
  templateUrl: './portaria.html',
  styleUrl: './portaria.css'
})
export class Portaria {
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

  callStudent(studentId: string) {
    this.studentService.updateStudentStatus(studentId, 'CHAMADO');
  }

  markAsDelivered(studentId: string) {
    this.studentService.updateStudentStatus(studentId, 'ENTREGUE');
  }
}

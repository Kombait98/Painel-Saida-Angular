import { Injectable, signal } from '@angular/core';
import { Student, ClassRoom, StudentStatus } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private channel = new BroadcastChannel('school_dismissal');

  public classes = signal<ClassRoom[]>([
    { id: '1', name: 'Turma A' },
    { id: '2', name: 'Turma B' },
    { id: '3', name: 'Turma C' },
    { id: '4', name: 'Turma D' },
    { id: '5', name: 'Turma E' }
  ]);

  private initialTime = Date.now();

  public students = signal<Student[]>([
    { id: '1', name: 'Joãozinho', classId: '1', status: 'NA_SALA', lastUpdatedAt: this.initialTime },
    { id: '2', name: 'Mariazinha', classId: '1', status: 'NA_SALA', lastUpdatedAt: this.initialTime },
    { id: '3', name: 'Pedrinho', classId: '2', status: 'NA_SALA', lastUpdatedAt: this.initialTime },
    { id: '4', name: 'Ana', classId: '2', status: 'NA_SALA', lastUpdatedAt: this.initialTime },
    { id: '5', name: 'Lucas', classId: '3', status: 'NA_SALA', lastUpdatedAt: this.initialTime },
    { id: '6', name: 'Julia', classId: '3', status: 'NA_SALA', lastUpdatedAt: this.initialTime },
    { id: '7', name: 'Marcos', classId: '4', status: 'NA_SALA', lastUpdatedAt: this.initialTime },
    { id: '8', name: 'Sofia', classId: '4', status: 'NA_SALA', lastUpdatedAt: this.initialTime },
    { id: '9', name: 'Gabriel', classId: '5', status: 'NA_SALA', lastUpdatedAt: this.initialTime },
    { id: '10', name: 'Beatriz', classId: '5', status: 'NA_SALA', lastUpdatedAt: this.initialTime }
  ]);

  constructor() {
    this.channel.onmessage = (event) => {
      if (event.data.type === 'SYNC_STUDENTS') {
        this.students.set(event.data.payload);
      }
    };
  }

  updateStudentStatus(studentId: string, status: StudentStatus) {
    this.students.update(students => 
      students.map(s => s.id === studentId ? { ...s, status, lastUpdatedAt: Date.now() } : s)
    );
    this.channel.postMessage({ type: 'SYNC_STUDENTS', payload: this.students() });
  }
}

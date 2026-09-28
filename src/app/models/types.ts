export type StudentStatus = 'NA_SALA' | 'CHAMADO' | 'SE_ARRUMANDO' | 'A_CAMINHO' | 'ENTREGUE';

export interface Student {
  id: string;
  name: string;
  classId: string;
  status: StudentStatus;
  lastUpdatedAt: number;
}

export interface ClassRoom {
  id: string;
  name: string;
}

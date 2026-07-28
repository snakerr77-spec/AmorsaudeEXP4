export type UserRole =
  | "admin"
  | "financeiro"
  | "gerencia"
  | "cdt"
  | "recepcao"
  | "medico"
  | "colaborador";

export interface LagUser {
  id?: string;
  uid?: string;
  nome?: string;
  nomeCompleto?: string;
  nome_completo?: string;
  email?: string;
  nivelAcesso?: UserRole | string;
  nivel_acesso?: UserRole | string;
  cidade?: string;
  telefone?: string;
  cargo?: string;
  setor?: string;
  foto?: string;
  capa?: string;
  ativo?: boolean;
}

export interface ApiResponse<T = unknown> {
  ok?: boolean;
  dados?: T;
  items?: T;
  dado?: T;
  item?: T;
  usuario?: LagUser;
  erro?: string;
  detalhe?: string;
}

export interface MedicalRecord {
  id?: string;
  patient: string;
  birthDate: string;
  phone: string;
  doctor: string;
  specialty: string;
  visitDate: string;
  visitTime: string;
  painLevel: string;
  painType: string;
  symptomStart: string;
  complaint: string;
  anamnesis: string;
  vitals: string;
  allergies: string;
  medicines: string;
  physicalExam: string;
  diagnosis: string;
  conduct: string;
  requestedTests: string;
  prescription: string;
  painAreas: string[];
  city: string;
  createdBy?: string;
  createdByName?: string;
  createdByEmail?: string;
  createdAtISO?: string;
  createdAt?: string;
  updatedAt?: string;
}

import { Paciente } from './paciente.models';

export interface CitaDto {
  paciente: string;
  fecha: string; // ISO string format
  motivo: string;
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  medico?: string;
}

export interface Cita {
  _id: string;
  paciente: Paciente; // Usa la interfaz Paciente completa
  fecha: string;
  motivo: string;
  estado: string;
  medico?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CitaResponse {
  data?: Cita | Cita[];
  message?: string;
  error?: string;
}

// Interface para filtros de búsqueda
export interface CitaFiltros {
  paciente?: string;
  medico?: string;
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  fechaInicio?: string;
  fechaFin?: string;
}
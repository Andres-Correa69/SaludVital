export interface CitaDto {
  paciente: string;
  fecha: string; // ISO string format
  motivo: string;
  estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  medico?: string; // ← AÑADIDO campo médico
}

export interface Cita {
  _id: string;
  paciente: {
    _id: string;
    user?: {
      nombre: string;
      email: string;
    };
    documento: string;
    // Campos adicionales que podrían venir del populate
    telefono?: string;
    direccion?: string;
  };
  fecha: string;
  motivo: string;
  estado: string;
  medico?: string; // ← AÑADIDO campo médico
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
}
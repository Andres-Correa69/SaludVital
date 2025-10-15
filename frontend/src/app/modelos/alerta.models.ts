export interface AlertaDto {
  paciente: string;
  titulo: string;
  mensaje: string;
  prioridad?: 'baja' | 'media' | 'alta'; // ← Opcional, default 'media'
  leida?: boolean; // ← Opcional, default false
  fechaProgramada?: string; // ← Opcional, ISO string format
}

export interface Alerta {
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
  titulo: string;
  mensaje: string;
  prioridad: string;
  leida: boolean;
  fechaProgramada?: string; // ← Opcional
  createdAt: string;
  updatedAt: string;
}

export interface AlertaResponse {
  data?: Alerta | Alerta[];
  message?: string;
  error?: string;
}

// Interface para filtros de búsqueda
export interface AlertaFiltros {
  paciente?: string;
}
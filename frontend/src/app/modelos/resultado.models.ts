export interface ResultadoDto {
  paciente: string;
  tipo: string;
  descripcion: string;
  fechaResultado: string; // ISO string format
  archivoUrl?: string; // ← Campo opcional
}

export interface Resultado {
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
  tipo: string;
  descripcion: string;
  fechaResultado: string;
  archivoUrl?: string; // ← Campo opcional
  createdAt: string;
  updatedAt: string;
}

export interface ResultadoResponse {
  data?: Resultado | Resultado[];
  message?: string;
  error?: string;
}

// Interface para filtros de búsqueda
export interface ResultadoFiltros {
  paciente?: string;
}
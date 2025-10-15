export interface PacienteDto {
  user: string;
  documento: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string; // ISO string format
  grupoSanguineo?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}

export interface Paciente {
  _id: string;
  user: {
    _id: string;
    nombre: string;
    email: string;
    rol: string;
  };
  documento: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  grupoSanguineo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PacienteResponse {
  data?: Paciente | Paciente[];
  message?: string;
  error?: string;
}
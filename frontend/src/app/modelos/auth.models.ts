export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  nombre: string;
  email: string;
  password: string;
  rol?: 'paciente' | 'admin' | 'medico';
}

// Interface para la respuesta del backend
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface ApiError {
  error: string;
  errors?: Array<{ msg: string; param: string }>;
}
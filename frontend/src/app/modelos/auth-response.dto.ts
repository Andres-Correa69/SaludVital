export interface AuthResponse {
  user: User;
  token: string; // JWT token para autenticación
}
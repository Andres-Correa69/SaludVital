import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginDTO } from '../modelos/login.dto';
import { RegistroDTO } from '../modelos/registro.dto';
import { AuthResponseDTO } from '../modelos/auth-response.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://saludvital-xtun.onrender.com/api/auth';
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) { }

  login(credentials: LoginDTO): Observable<AuthResponseDTO> {
    return this.http.post<AuthResponseDTO>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response && response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  register(data: RegistroDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
  }

  getCurrentUser(): any | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      // Decodificar la parte del payload del token (la segunda parte)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      console.error('Error al decodificar el token', e);
      return null;
    }
  }
}
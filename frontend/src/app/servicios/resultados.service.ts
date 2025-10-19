import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

// Interfaz para el modelo de Resultado
export interface Resultado {
  _id: string;
  pacienteId: string;
  tipoExamen: string;
  fecha: Date;
  resultado: string; // Un resumen o texto del resultado
  archivoUrl?: string; // Un enlace opcional a un archivo PDF
}

@Injectable({
  providedIn: 'root'
})
export class ResultadosService {
  private apiUrl = 'https://saludvital-xtun.onrender.com/api/resultados';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getAuthHeaders(): HttpHeaders | null {
    const token = this.authService.getToken();
    if (!token) {
      return null;
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todos los resultados del usuario logueado
  getResultados(): Observable<Resultado[]> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return of([]);
    }
    return this.http.get<Resultado[]>(this.apiUrl, { headers });
  }

  // Obtener un resultado específico por su ID
  getResultadoById(id: string): Observable<Resultado> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return new Observable(observer => observer.error('Usuario no autenticado'));
    }
    return this.http.get<Resultado>(`${this.apiUrl}/${id}`, { headers });
  }
}

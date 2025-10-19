import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

// Interfaz para el modelo de Cita
export interface Cita {
  _id: string;
  fecha: Date;
  especialidad: string;
  descripcion: string;
  pacienteId: string;
  estado: 'programada' | 'cancelada' | 'realizada';
}

// Interfaz para los datos de una nueva cita
export interface NuevaCitaDTO {
  fecha: Date;
  especialidad: string;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  private apiUrl = 'https://saludvital-xtun.onrender.com/api/citas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  // Método para obtener las cabeceras de autenticación
  private getAuthHeaders(): HttpHeaders | null {
    const token = this.authService.getToken();
    if (!token) {
      return null;
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Obtener todas las citas del usuario logueado
  getCitas(): Observable<Cita[]> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return of([]);
    }
    return this.http.get<Cita[]>(this.apiUrl, { headers });
  }

  // Agendar una nueva cita
  agendarCita(citaData: NuevaCitaDTO): Observable<Cita> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      // Esto previene la llamada si no hay token, se podría manejar el error de otra forma
      return new Observable(observer => observer.error('Usuario no autenticado'));
    }
    return this.http.post<Cita>(this.apiUrl, citaData, { headers });
  }
}

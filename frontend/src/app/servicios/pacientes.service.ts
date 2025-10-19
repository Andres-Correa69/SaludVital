import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

// Interfaz para el modelo de Paciente
export interface Paciente {
  _id: string;
  userId: string; // Referencia al modelo User
  nombre: string;
  apellido: string;
  fechaNacimiento: Date;
  genero: string;
  informacionContacto: {
    telefono: string;
    direccion: string;
  };
  historialMedico: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PacientesService {
  private apiUrl = 'https://saludvital-xtun.onrender.com/api/pacientes';

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

  // Obtener el perfil del paciente logueado
  getMiPerfil(): Observable<Paciente> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return new Observable(observer => observer.error('Usuario no autenticado'));
    }
    // Asumo que el backend tiene una ruta como '/perfil' que devuelve los datos del usuario por su token
    return this.http.get<Paciente>(`${this.apiUrl}/perfil`, { headers });
  }

  // Actualizar el perfil del paciente logueado
  actualizarMiPerfil(perfilData: Partial<Paciente>): Observable<Paciente> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return new Observable(observer => observer.error('Usuario no autenticado'));
    }
    return this.http.put<Paciente>(`${this.apiUrl}/perfil`, perfilData, { headers });
  }
}

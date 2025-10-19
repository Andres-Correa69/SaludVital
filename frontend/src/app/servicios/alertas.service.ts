import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

// Interfaz para el modelo de Alerta
export interface Alerta {
  _id: string;
  mensaje: string;
  fecha: Date;
  pacienteId: string;
  leida: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AlertasService {
  private apiUrl = 'https://saludvital-xtun.onrender.com/api/alertas';

  constructor(
    private http: HttpClient,
    private authService: AuthService // Inyectar AuthService
  ) { }

  getAlertas(): Observable<Alerta[]> {
    const token = this.authService.getToken();

    if (!token) {
      return of([]); // Retorna un observable vacío si no hay token
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Alerta[]>(this.apiUrl, { headers });
  }
}

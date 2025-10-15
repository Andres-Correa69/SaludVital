import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Alerta, AlertaDto, AlertaFiltros } from '../modelos/alerta.models';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private apiService = inject(ApiService);

  // Listar alertas con filtro opcional por paciente
  listarAlertas(filtros?: AlertaFiltros): Observable<Alerta[]> {
    let url = '/alertas';
    
    // Agregar parámetros de query si existen filtros
    if (filtros?.paciente) {
      url += `?paciente=${filtros.paciente}`;
    }
    
    return this.apiService.get<Alerta[]>(url);
  }

  obtenerAlerta(id: string): Observable<Alerta> {
    return this.apiService.get<Alerta>(`/alertas/${id}`);
  }

  crearAlerta(alertaDto: AlertaDto): Observable<Alerta> {
    return this.apiService.post<Alerta>('/alertas', alertaDto);
  }

  actualizarAlerta(id: string, alertaDto: Partial<AlertaDto>): Observable<Alerta> {
    return this.apiService.put<Alerta>(`/alertas/${id}`, alertaDto);
  }

  eliminarAlerta(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/alertas/${id}`);
  }

  // Métodos específicos para operaciones comunes
  marcarComoLeida(id: string): Observable<Alerta> {
    return this.actualizarAlerta(id, { leida: true });
  }

  marcarComoNoLeida(id: string): Observable<Alerta> {
    return this.actualizarAlerta(id, { leida: false });
  }

  cambiarPrioridad(id: string, prioridad: 'baja' | 'media' | 'alta'): Observable<Alerta> {
    return this.actualizarAlerta(id, { prioridad });
  }
}
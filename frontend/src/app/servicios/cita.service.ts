import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Cita, CitaDto, CitaFiltros } from '../modelos/cita.models';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiService = inject(ApiService);

  // Listar citas con filtro opcional por paciente
  listarCitas(filtros?: CitaFiltros): Observable<Cita[]> {
    let url = '/citas';
    
    // Agregar parámetros de query si existen filtros
    if (filtros?.paciente) {
      url += `?paciente=${filtros.paciente}`;
    }
    
    return this.apiService.get<Cita[]>(url);
  }

  obtenerCita(id: string): Observable<Cita> {
    return this.apiService.get<Cita>(`/citas/${id}`);
  }

  crearCita(citaDto: CitaDto): Observable<Cita> {
    return this.apiService.post<Cita>('/citas', citaDto);
  }

  actualizarCita(id: string, citaDto: Partial<CitaDto>): Observable<Cita> {
    return this.apiService.put<Cita>(`/citas/${id}`, citaDto);
  }

  eliminarCita(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/citas/${id}`);
  }
}
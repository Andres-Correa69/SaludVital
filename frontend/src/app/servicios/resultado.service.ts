import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Resultado, ResultadoDto, ResultadoFiltros } from '../modelos/resultado.models';

@Injectable({
  providedIn: 'root'
})
export class ResultadoService {
  private apiService = inject(ApiService);

  // Listar resultados con filtro opcional por paciente
  listarResultados(filtros?: ResultadoFiltros): Observable<Resultado[]> {
    let url = '/resultados';
    
    // Agregar parámetros de query si existen filtros
    if (filtros?.paciente) {
      url += `?paciente=${filtros.paciente}`;
    }
    
    return this.apiService.get<Resultado[]>(url);
  }

  obtenerResultado(id: string): Observable<Resultado> {
    return this.apiService.get<Resultado>(`/resultados/${id}`);
  }

  crearResultado(resultadoDto: ResultadoDto): Observable<Resultado> {
    return this.apiService.post<Resultado>('/resultados', resultadoDto);
  }

  actualizarResultado(id: string, resultadoDto: Partial<ResultadoDto>): Observable<Resultado> {
    return this.apiService.put<Resultado>(`/resultados/${id}`, resultadoDto);
  }

  eliminarResultado(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/resultados/${id}`);
  }
}
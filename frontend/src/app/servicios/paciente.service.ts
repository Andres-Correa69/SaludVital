import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Paciente, PacienteDto, PacienteResponse } from '../modelos/paciente.models';

@Injectable({
  providedIn: 'root'
})
export class PacienteService {
  private apiService = inject(ApiService);

  listarPacientes(): Observable<Paciente[]> {
    return this.apiService.get<Paciente[]>('/pacientes');
  }

  obtenerPaciente(id: string): Observable<Paciente> {
    return this.apiService.get<Paciente>(`/pacientes/${id}`);
  }

  crearPaciente(pacienteDto: PacienteDto): Observable<Paciente> {
    return this.apiService.post<Paciente>('/pacientes', pacienteDto);
  }

  actualizarPaciente(id: string, pacienteDto: Partial<PacienteDto>): Observable<Paciente> {
    return this.apiService.put<Paciente>(`/pacientes/${id}`, pacienteDto);
  }

  eliminarPaciente(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`/pacientes/${id}`);
  }
}
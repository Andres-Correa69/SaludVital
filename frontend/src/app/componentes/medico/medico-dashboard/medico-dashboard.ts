import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../servicios/auth.service';
import { CitaService } from '../../../servicios/cita.service';
import { PacienteService } from '../../../servicios/paciente.service';
import { ResultadoService } from '../../../servicios/resultado.service';
import { Cita, CitaDto } from '../../../modelos/cita.models';
import { ResultadoDto, Resultado } from '../../../modelos/resultado.models';
import { NavbarMedicoComponent } from '../navbar-medico/navbar-medico';

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarMedicoComponent],
  templateUrl: './medico-dashboard.html',
  styleUrls: ['./medico-dashboard.css']
})
export class MedicoDashboardComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private citaService = inject(CitaService);
  private pacienteService = inject(PacienteService);
  private resultadoService = inject(ResultadoService);
  private router = inject(Router);

  // Datos del médico
  medicoActual: any;
  
  // Citas
  citasPendientes: Cita[] = [];
  citasCompletadas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  todasLasCitas: Cita[] = [];
  
  // Estados y filtros
  isLoading: boolean = false;
  filtroEstado: string = 'todas';
  searchTerm: string = '';
  
  // Modales
  mostrarModalDetalles: boolean = false;
  mostrarResultados: boolean = false;
  
  // Cita seleccionada
  citaSeleccionada: Cita | null = null;
  isEditingResultado: boolean = false;
  resultadoCita: Resultado | null = null;
  
  // Formulario de resultados
  resultadoData: ResultadoDto = {
    paciente: '',
    tipo: 'consulta',
    descripcion: '',
    fechaResultado: new Date().toISOString().split('T')[0],
    archivoUrl: ''
  };

  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.medicoActual = this.authService.getCurrentUser();
    this.cargarCitas();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  cargarCitas(): void {
    this.isLoading = true;
    
    const subscription = this.citaService.listarCitas().subscribe({
      next: (citas: Cita[]) => {
        // Filtrar citas del médico actual - manejar diferentes estructuras de médico
        this.todasLasCitas = citas.filter(cita => {
          let medicoId: string | undefined;
          if (typeof cita.medico === 'string') {
            medicoId = cita.medico;
          } else if (cita.medico && typeof cita.medico === 'object' && '_id' in cita.medico) {
            medicoId = (cita.medico as { _id: string })._id;
          }
          return medicoId === this.medicoActual?.id || medicoId === this.medicoActual?._id;
        });
        
        this.citasPendientes = this.todasLasCitas.filter(cita => 
          cita.estado === 'pendiente' || cita.estado === 'confirmada'
        );
        
        this.citasCompletadas = this.todasLasCitas.filter(cita => 
          cita.estado === 'completada'
        );
        
        this.citasFiltradas = [...this.todasLasCitas];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando citas:', error);
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(subscription);
  }

  filtrarCitas(): void {
    let citasFiltradas = [...this.todasLasCitas];

    // Aplicar filtro por estado
    if (this.filtroEstado !== 'todas') {
      citasFiltradas = citasFiltradas.filter(cita => cita.estado === this.filtroEstado);
    }

    // Aplicar filtro por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      citasFiltradas = citasFiltradas.filter(cita =>
        this.getPacienteNombre(cita).toLowerCase().includes(term) ||
        cita.motivo?.toLowerCase().includes(term) ||
        this.getPacienteDocumento(cita).toLowerCase().includes(term)
      );
    }

    this.citasFiltradas = citasFiltradas;
  }

  verDetallesCita(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.citaSeleccionada = null;
  }

  seleccionarCita(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.isEditingResultado = true;
    
    // Inicializar formulario con datos de la cita
    this.resultadoData = {
      paciente: this.getPacienteId(cita),
      tipo: 'consulta',
      descripcion: '',
      fechaResultado: new Date().toISOString().split('T')[0],
      archivoUrl: ''
    };
  }

  cerrarEditor(): void {
    this.isEditingResultado = false;
    this.citaSeleccionada = null;
    this.resultadoData = {
      paciente: '',
      tipo: 'consulta',
      descripcion: '',
      fechaResultado: new Date().toISOString().split('T')[0],
      archivoUrl: ''
    };
  }

  verResultadosCita(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.mostrarResultados = true;
    
    // Cargar resultados reales de la cita
    this.isLoading = true;
    
    // Usar filtros para obtener resultados del paciente específico
    const filtros = { paciente: this.getPacienteId(cita) };
    
    const subscription = this.resultadoService.listarResultados(filtros).subscribe({
      next: (resultados: Resultado[]) => {
        if (resultados && resultados.length > 0) {
          // Ordenar por fecha más reciente y tomar el primero
          resultados.sort((a, b) => 
            new Date(b.fechaResultado).getTime() - new Date(a.fechaResultado).getTime()
          );
          this.resultadoCita = resultados[0];
        } else {
          this.resultadoCita = null;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error cargando resultados:', error);
        this.resultadoCita = null;
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(subscription);
  }

  cerrarResultados(): void {
    this.mostrarResultados = false;
    this.citaSeleccionada = null;
    this.resultadoCita = null;
  }

  guardarResultado(): void {
    if (!this.citaSeleccionada) return;

    this.isLoading = true;

    // Primero actualizar la cita como completada
    const citaUpdate: Partial<CitaDto> = {
      estado: 'completada'
    };

    const updateSubscription = this.citaService.actualizarCita(this.citaSeleccionada._id, citaUpdate).subscribe({
      next: (citaActualizada) => {
        // Luego crear el resultado
        const resultadoSubscription = this.resultadoService.crearResultado(this.resultadoData).subscribe({
          next: (resultado) => {
            this.isLoading = false;
            this.cerrarEditor();
            this.cargarCitas(); // Recargar lista para reflejar cambios
          },
          error: (error) => {
            console.error('Error creando resultado:', error);
            this.isLoading = false;
          }
        });
        
        this.subscriptions.push(resultadoSubscription);
      },
      error: (error) => {
        console.error('Error actualizando cita:', error);
        this.isLoading = false;
      }
    });
    
    this.subscriptions.push(updateSubscription);
  }

  // Método auxiliar para obtener ID del paciente
  private getPacienteId(cita: Cita): string {
    return typeof cita.paciente === 'string' ? cita.paciente : cita.paciente._id;
  }

  // Métodos auxiliares para obtener datos de pacientes
  getPacienteNombre(cita: Cita): string {
    // Manejar diferentes estructuras de datos que podrían venir del backend
    if (typeof cita.paciente === 'object' && cita.paciente.user?.nombre) {
      return cita.paciente.user.nombre;
    } else if (typeof cita.paciente === 'object' && (cita.paciente as any).nombre) {
      return (cita.paciente as any).nombre;
    } else if (typeof cita.paciente === 'string') {
      return 'Paciente (ID: ' + cita.paciente + ')';
    }
    return 'Paciente';
  }

  getPacienteEmail(cita: Cita): string {
    if (typeof cita.paciente === 'object' && cita.paciente.user?.email) {
      return cita.paciente.user.email;
    } else if (typeof cita.paciente === 'object' && (cita.paciente as any).email) {
      return (cita.paciente as any).email;
    }
    return 'No disponible';
  }

  getPacienteDocumento(cita: Cita): string {
    if (typeof cita.paciente === 'object' && cita.paciente.documento) {
      return cita.paciente.documento;
    } else if (typeof cita.paciente === 'string') {
      return 'Documento no disponible';
    }
    return 'No disponible';
  }

  getPacienteTelefono(cita: Cita): string {
    if (typeof cita.paciente === 'object' && cita.paciente.telefono) {
      return cita.paciente.telefono;
    }
    return 'No disponible';
  }

  getPacienteDireccion(cita: Cita): string {
    if (typeof cita.paciente === 'object' && cita.paciente.direccion) {
      return cita.paciente.direccion;
    }
    return 'No disponible';
  }

  // Métodos de formato
  formatearFecha(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  }

  formatearFechaCorta(fecha: string): string {
    try {
      return new Date(fecha).toLocaleDateString('es-ES');
    } catch (error) {
      return 'Fecha no disponible';
    }
  }

  formatearHora(fecha: string): string {
    try {
      return new Date(fecha).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Hora no disponible';
    }
  }

  formatearFechaHora(fecha: string): string {
    try {
      return new Date(fecha).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  }

  // Métodos para estados
  getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-pendiente';
      case 'completada': return 'badge-completada';
      case 'cancelada': return 'badge-cancelada';
      case 'confirmada': return 'badge-confirmada';
      default: return 'badge-pendiente';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'confirmada': return 'Confirmada';
      default: return estado;
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'fa-clock';
      case 'completada': return 'fa-check-circle';
      case 'cancelada': return 'fa-times-circle';
      case 'confirmada': return 'fa-calendar-check';
      default: return 'fa-clock';
    }
  }

  getTipoConsultaTexto(tipo: string): string {
    switch (tipo) {
      case 'consulta': return 'Consulta General';
      case 'seguimiento': return 'Seguimiento';
      case 'emergencia': return 'Emergencia';
      case 'control': return 'Control';
      default: return tipo;
    }
  }

  // Método para recargar citas
  recargarCitas(): void {
    this.cargarCitas();
  }
}
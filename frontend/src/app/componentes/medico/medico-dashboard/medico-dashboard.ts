import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CitaService } from '../../../servicios/cita.service';
import { AuthService } from '../../../servicios/auth.service';
import { Cita } from '../../../modelos/cita.models';
import { NavbarMedicoComponent } from '../navbar-medico/navbar-medico';

interface ResultadoData {
  tipo: string;
  fechaResultado: string;
  descripcion: string;
  archivoUrl: string;
}

@Component({
  selector: 'app-medico-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarMedicoComponent],
  templateUrl: './medico-dashboard.html',
  styleUrls: ['./medico-dashboard.css']
})
export class MedicoDashboard implements OnInit, OnDestroy {
  private citaService = inject(CitaService);
  private authService = inject(AuthService);
  private destroy$ = new Subject<void>();

  // Estado de carga
  isLoading = false;

  // Datos del médico actual
  medicoActual: any;

  // Citas
  todasLasCitas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  citasPendientes: Cita[] = [];
  citasCompletadas: Cita[] = [];

  // Filtros y búsqueda
  filtroEstado: string = 'todas';
  searchTerm: string = '';

  // Modales
  mostrarModalDetalles = false;
  isEditingResultado = false;
  mostrarResultados = false;
  citaSeleccionada: Cita | null = null;
  resultadoCita: any = null;

  // Datos del formulario de resultados
  resultadoData: ResultadoData = {
    tipo: 'consulta',
    fechaResultado: new Date().toISOString().split('T')[0],
    descripcion: '',
    archivoUrl: ''
  };

  ngOnInit(): void {
    this.obtenerMedicoActual();
    this.cargarCitas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private obtenerMedicoActual(): void {
    this.medicoActual = this.authService.getCurrentUser();
    console.log('👨‍⚕️ Médico actual:', this.medicoActual);
  }

  cargarCitas(): void {
    this.isLoading = true;
    
    this.citaService.listarCitas()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (citas) => {
          console.log('📋 Citas recibidas:', citas);
          console.log('🔍 Análisis de pacientes en citas:');
          
          citas.forEach((cita, index) => {
            console.log(`Cita ${index}:`, {
              id: cita._id,
              tienePaciente: !!cita.paciente,
              paciente: cita.paciente,
              motivo: cita.motivo
            });
          });

          this.todasLasCitas = citas;
          this.actualizarEstadisticas();
          this.filtrarCitas();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar citas:', error);
          this.isLoading = false;
          alert('Error al cargar las citas. Por favor, intente nuevamente.');
        }
      });
  }

  actualizarEstadisticas(): void {
    this.citasPendientes = this.todasLasCitas.filter(
      c => c.estado === 'pendiente' || c.estado === 'confirmada'
    );
    this.citasCompletadas = this.todasLasCitas.filter(
      c => c.estado === 'completada'
    );
  }

  filtrarCitas(): void {
    let citasFiltradas = [...this.todasLasCitas];

    // Filtrar por estado
    if (this.filtroEstado !== 'todas') {
      citasFiltradas = citasFiltradas.filter(
        cita => cita.estado === this.filtroEstado
      );
    }

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase().trim();
      citasFiltradas = citasFiltradas.filter(cita => {
        const nombrePaciente = this.getPacienteNombre(cita).toLowerCase();
        const motivo = cita.motivo.toLowerCase();
        const documento = this.getPacienteDocumento(cita).toLowerCase();
        
        return nombrePaciente.includes(termino) || 
               motivo.includes(termino) || 
               documento.includes(termino);
      });
    }

    // Ordenar por fecha (más recientes primero)
    citasFiltradas.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    this.citasFiltradas = citasFiltradas;
  }

  // MÉTODOS ACTUALIZADOS PARA MANEJAR PACIENTES NULL
  getPacienteNombre(cita: Cita): string {
    if (!cita.paciente) return 'Paciente no asignado';
    
    // Manejar diferentes estructuras de datos
    if (typeof cita.paciente === 'object') {
      // Si tiene estructura con user
      if (cita.paciente.user && typeof cita.paciente.user === 'object') {
        return cita.paciente.user.nombre || 'Paciente';
      }
      // Si tiene nombre directamente
      if ((cita.paciente as any).nombre) {
        return (cita.paciente as any).nombre;
      }
      // Si no tiene nombre pero es objeto, indicar que está incompleto
      return 'Paciente (sin nombre)';
    } else if (typeof cita.paciente === 'string') {
      return 'Paciente (ID: ' + cita.paciente + ')';
    }
    return 'Paciente no asignado';
  }

  getPacienteEmail(cita: Cita): string {
    if (!cita.paciente) return 'No disponible';
    
    if (typeof cita.paciente === 'object') {
      if (cita.paciente.user && typeof cita.paciente.user === 'object') {
        return cita.paciente.user.email || 'No disponible';
      }
      if ((cita.paciente as any).email) {
        return (cita.paciente as any).email;
      }
    }
    return 'No disponible';
  }

  getPacienteDocumento(cita: Cita): string {
    if (!cita.paciente) return 'No disponible';
    
    if (typeof cita.paciente === 'object') {
      return cita.paciente.documento || 'No disponible';
    } else if (typeof cita.paciente === 'string') {
      return 'Documento no disponible';
    }
    return 'No disponible';
  }

  getPacienteTelefono(cita: Cita): string {
    if (!cita.paciente) return 'No disponible';
    
    if (typeof cita.paciente === 'object') {
      return cita.paciente.telefono || 'No disponible';
    }
    return 'No disponible';
  }

  getPacienteDireccion(cita: Cita): string {
    if (!cita.paciente) return 'No disponible';
    
    if (typeof cita.paciente === 'object') {
      return cita.paciente.direccion || 'No disponible';
    }
    return 'No disponible';
  }

  getPacienteFechaNacimiento(cita: Cita): string {
    if (!cita.paciente) return 'No disponible';
    
    if (typeof cita.paciente === 'object') {
      return cita.paciente.fechaNacimiento 
        ? this.formatearFecha(cita.paciente.fechaNacimiento)
        : 'No disponible';
    }
    return 'No disponible';
  }

  getPacienteGrupoSanguineo(cita: Cita): string {
    if (!cita.paciente) return 'No disponible';
    
    if (typeof cita.paciente === 'object') {
      return cita.paciente.grupoSanguineo || 'No disponible';
    }
    return 'No disponible';
  }

  // Método auxiliar para obtener ID del paciente
  getPacienteId(cita: Cita): string {
    if (!cita.paciente) return '';
    
    if (typeof cita.paciente === 'string') {
      return cita.paciente;
    } else if (typeof cita.paciente === 'object') {
      return cita.paciente._id || '';
    }
    return '';
  }

  // Método para verificar si una cita tiene paciente asignado
  tienePacienteAsignado(cita: Cita): boolean {
    return !!cita.paciente;
  }

  // Método para obtener información resumida del paciente
  getInfoPaciente(cita: Cita): string {
    if (!cita.paciente) return '⚠️ Sin paciente asignado';
    
    const nombre = this.getPacienteNombre(cita);
    const documento = this.getPacienteDocumento(cita);
    
    if (documento !== 'No disponible') {
      return `${nombre} - ${documento}`;
    }
    
    return nombre;
  }

  // Métodos de formateo de fechas (se mantienen igual)
  formatearFecha(fecha: string): string {
    if (!fecha) return 'No disponible';
    try {
      const date = new Date(fecha);
      const opciones: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      return 'Fecha no válida';
    }
  }

  formatearFechaCorta(fecha: string): string {
    if (!fecha) return 'No disponible';
    try {
      const date = new Date(fecha);
      const opciones: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      };
      return date.toLocaleDateString('es-ES', opciones);
    } catch (error) {
      return 'Fecha no válida';
    }
  }

  formatearHora(fecha: string): string {
    if (!fecha) return 'No disponible';
    try {
      const date = new Date(fecha);
      return date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Hora no válida';
    }
  }

  formatearFechaHora(fecha: string): string {
    if (!fecha) return 'No disponible';
    try {
      return `${this.formatearFecha(fecha)} a las ${this.formatearHora(fecha)}`;
    } catch (error) {
      return 'Fecha/hora no válida';
    }
  }

  // Métodos para estados
  getEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
  }

  getEstadoBadgeClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'pendiente': 'badge-pendiente',
      'confirmada': 'badge-confirmada',
      'completada': 'badge-completada',
      'cancelada': 'badge-cancelada'
    };
    return clases[estado] || 'badge-pendiente';
  }

  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      'pendiente': 'fa-clock',
      'confirmada': 'fa-check-circle',
      'completada': 'fa-check-double',
      'cancelada': 'fa-times-circle'
    };
    return iconos[estado] || 'fa-question-circle';
  }

  // Métodos para modales
  verDetallesCita(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.citaSeleccionada = null;
  }

  seleccionarCita(cita: Cita): void {
    // Solo permitir seleccionar citas que tienen paciente asignado
    if (!this.tienePacienteAsignado(cita)) {
      alert('No se puede completar una cita sin paciente asignado');
      return;
    }

    this.citaSeleccionada = cita;
    this.isEditingResultado = true;
    this.mostrarModalDetalles = false;
    
    // Resetear datos del formulario
    this.resultadoData = {
      tipo: 'consulta',
      fechaResultado: new Date().toISOString().split('T')[0],
      descripcion: '',
      archivoUrl: ''
    };
  }

  cerrarEditor(): void {
    this.isEditingResultado = false;
    this.citaSeleccionada = null;
    this.resultadoData = {
      tipo: 'consulta',
      fechaResultado: new Date().toISOString().split('T')[0],
      descripcion: '',
      archivoUrl: ''
    };
  }

  guardarResultado(): void {
    if (!this.citaSeleccionada) {
      alert('No hay cita seleccionada');
      return;
    }

    // Verificar que la cita tenga paciente asignado
    if (!this.tienePacienteAsignado(this.citaSeleccionada)) {
      alert('No se puede guardar resultado para una cita sin paciente asignado');
      return;
    }

    if (!this.resultadoData.descripcion.trim()) {
      alert('Por favor complete la descripción del resultado');
      return;
    }

    this.isLoading = true;

    // Actualizar el estado de la cita a 'completada'
    this.citaService.actualizarCita(this.citaSeleccionada._id, {
      estado: 'completada'
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (citaActualizada) => {
        console.log('✅ Cita completada:', citaActualizada);
        
        alert('Cita completada exitosamente');
        this.isLoading = false;
        this.cerrarEditor();
        this.cargarCitas();
      },
      error: (error) => {
        console.error('❌ Error al completar la cita:', error);
        this.isLoading = false;
        alert('Error al completar la cita. Por favor, intente nuevamente.');
      }
    });
  }

  verResultadosCita(cita: Cita): void {
    // Solo permitir ver resultados si hay paciente asignado
    if (!this.tienePacienteAsignado(cita)) {
      alert('No hay resultados disponibles para citas sin paciente asignado');
      return;
    }

    this.citaSeleccionada = cita;
    this.mostrarResultados = true;
    this.resultadoCita = null;
  }

  cerrarResultados(): void {
    this.mostrarResultados = false;
    this.citaSeleccionada = null;
    this.resultadoCita = null;
  }

  recargarCitas(): void {
    this.cargarCitas();
  }
}
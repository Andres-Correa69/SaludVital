import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { CitaService } from '../../servicios/cita.service';
import { AuthService } from '../../servicios/auth.service';
import { Cita } from '../../modelos/cita.models';
import { User } from '../../modelos/auth.models';

interface Recordatorio {
  texto: string;
  tiempo: string;
  icono: string;
}

interface Contadores {
  pendientes: number;
  confirmadas: number;
  completadas: number;
  totales: number;
}

@Component({
  selector: 'app-lista-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './lista-citas.html',
  styleUrls: ['./lista-citas.css']
})
export class ListaCitas implements OnInit {
  private citaService = inject(CitaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Datos reales
  citas: Cita[] = [];
  usuarioActual: User | null = null;

  recordatorios: Recordatorio[] = [
    {
      texto: 'Recuerda llegar 15 minutos antes de tu cita',
      tiempo: 'Siempre',
      icono: 'fa-clock'
    },
    {
      texto: 'Traer documento de identificación',
      tiempo: 'En cada cita',
      icono: 'fa-id-card'
    },
    {
      texto: 'Traer resultados de exámenes previos',
      tiempo: 'Si aplica',
      icono: 'fa-file-medical'
    }
  ];

  filtroEstado: string = 'todas';
  citasFiltradas: Cita[] = [];
  citaSeleccionada: Cita | null = null;
  citaEditada: any = null;
  contadores: Contadores = {
    pendientes: 0,
    confirmadas: 0,
    completadas: 0,
    totales: 0
  };

  isLoading: boolean = true;
  errorMessage: string = '';
  mostrarModalDetalles: boolean = false;
  mostrarModalEdicion: boolean = false;

  // Variables para edición
  horariosDisponibles: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  constructor() {}

  ngOnInit() {
    this.usuarioActual = this.authService.getCurrentUser();
    
    if (!this.usuarioActual) {
      this.errorMessage = 'No se pudo obtener la información del usuario.';
      this.isLoading = false;
      return;
    }

    this.cargarCitas();
  }

  // Cargar citas del servicio
  cargarCitas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filtros = { paciente: this.usuarioActual?.id };

    this.citaService.listarCitas(filtros).subscribe({
      next: (citas) => {
        this.citas = citas;
        this.calcularContadores();
        this.filtrarCitas();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.errorMessage = 'Error al cargar las citas. Inténtelo de nuevo.';
        this.isLoading = false;
        
        // Datos de ejemplo en caso de error (solo para desarrollo)
        this.cargarCitasDeEjemplo();
      }
    });
  }

  // Datos de ejemplo para desarrollo
  private cargarCitasDeEjemplo(): void {
    this.citas = [
      {
        _id: '1',
        paciente: {
          _id: this.usuarioActual?.id || '',
          documento: '123456789',
          user: {
            nombre: this.usuarioActual?.nombre || 'Usuario',
            email: this.usuarioActual?.email || 'usuario@email.com'
          }
        },
        fecha: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 días en el futuro
        motivo: 'Consulta general por dolor de cabeza persistente',
        estado: 'confirmada',
        medico: 'Dr. Carlos Rodríguez',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        paciente: {
          _id: this.usuarioActual?.id || '',
          documento: '123456789',
          user: {
            nombre: this.usuarioActual?.nombre || 'Usuario',
            email: this.usuarioActual?.email || 'usuario@email.com'
          }
        },
        fecha: new Date(Date.now() + 86400000 * 5).toISOString(), // 5 días en el futuro
        motivo: 'Control de rutina',
        estado: 'pendiente',
        medico: 'Dra. Ana Martínez',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        paciente: {
          _id: this.usuarioActual?.id || '',
          documento: '123456789',
          user: {
            nombre: this.usuarioActual?.nombre || 'Usuario',
            email: this.usuarioActual?.email || 'usuario@email.com'
          }
        },
        fecha: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 días en el pasado
        motivo: 'Consulta de seguimiento',
        estado: 'completada',
        medico: 'Dr. Luis García',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.calcularContadores();
    this.filtrarCitas();
  }

  // Filtros y búsqueda
  filtrarCitas(): void {
    if (this.filtroEstado === 'todas') {
      this.citasFiltradas = [...this.citas];
    } else {
      this.citasFiltradas = this.citas.filter(cita => cita.estado === this.filtroEstado);
    }
  }

  // Cálculo de estadísticas
  calcularContadores(): void {
    this.contadores.pendientes = this.citas.filter(c => c.estado === 'pendiente').length;
    this.contadores.confirmadas = this.citas.filter(c => c.estado === 'confirmada').length;
    this.contadores.completadas = this.citas.filter(c => c.estado === 'completada').length;
    this.contadores.totales = this.citas.length;
  }

  // Getters para datos procesados
  get citasProximas(): Cita[] {
    const hoy = new Date();
    return this.citasFiltradas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      return fechaCita >= hoy && (cita.estado === 'pendiente' || cita.estado === 'confirmada');
    }).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }

  get citasPasadas(): Cita[] {
    const hoy = new Date();
    return this.citasFiltradas.filter(cita => {
      const fechaCita = new Date(cita.fecha);
      return fechaCita < hoy || cita.estado === 'completada' || cita.estado === 'cancelada';
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  get proximaCita(): Cita | null {
    const proximas = this.citasProximas;
    return proximas.length > 0 ? proximas[0] : null;
  }

  // Utilidades de formato
  formatearFecha(fecha: string): string {
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  }

  formatearFechaHora(fecha: string): string {
    const opciones: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  }

  getHora(fecha: string): string {
    const opciones: Intl.DateTimeFormatOptions = { 
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(fecha).toLocaleTimeString('es-ES', opciones);
  }

  getDia(fecha: string): string {
    return new Date(fecha).getDate().toString();
  }

  getMes(fecha: string): string {
    const opciones: Intl.DateTimeFormatOptions = { month: 'short' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones).split(' ')[0];
  }

  // Utilidades de estado
  getEstadoIcon(estado: string): string {
    const iconos: { [key: string]: string } = {
      'pendiente': 'fa-clock',
      'confirmada': 'fa-check-circle',
      'completada': 'fa-calendar-check',
      'cancelada': 'fa-times-circle'
    };
    return iconos[estado] || 'fa-calendar';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return textos[estado] || estado;
  }

  getMensajeEstadoVacio(): string {
    const mensajes: { [key: string]: string } = {
      'todas': 'programadas',
      'pendiente': 'pendientes',
      'confirmada': 'confirmadas',
      'completada': 'completadas',
      'cancelada': 'canceladas'
    };
    return mensajes[this.filtroEstado] || '';
  }

  // Acciones principales
  irAAgendarCita(): void {
    this.router.navigate(['/agendar-cita']);
  }

  verDetalles(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.citaSeleccionada = null;
  }

  editarCita(cita: Cita): void {
    this.citaSeleccionada = cita;
    this.citaEditada = {
      ...cita,
      fecha: this.obtenerFechaFormatoInput(cita.fecha),
      hora: this.getHora(cita.fecha)
    };
    this.mostrarModalEdicion = true;
  }

  cancelarEdicion(): void {
    this.mostrarModalEdicion = false;
    this.citaSeleccionada = null;
    this.citaEditada = null;
  }

  guardarEdicion(): void {
    if (!this.formularioEdicionValido() || !this.citaSeleccionada || !this.citaEditada) {
      return;
    }

    this.isLoading = true;

    // Combinar fecha y hora
    const fechaCompleta = new Date(this.citaEditada.fecha);
    const [horas, minutos] = this.citaEditada.hora.split(':');
    fechaCompleta.setHours(parseInt(horas), parseInt(minutos));

    const datosActualizados = {
      medico: this.citaEditada.medico,
      fecha: fechaCompleta.toISOString(),
      motivo: this.citaEditada.motivo
    };

    this.citaService.actualizarCita(this.citaSeleccionada._id, datosActualizados).subscribe({
      next: (citaActualizada) => {
        // Actualizar la cita localmente
        const index = this.citas.findIndex(c => c._id === this.citaSeleccionada!._id);
        if (index !== -1) {
          this.citas[index] = citaActualizada;
        }
        this.calcularContadores();
        this.filtrarCitas();
        this.isLoading = false;
        this.mostrarModalEdicion = false;
        this.citaSeleccionada = null;
        this.citaEditada = null;
        alert('Cita actualizada exitosamente');
      },
      error: (error) => {
        console.error('Error al actualizar cita:', error);
        this.isLoading = false;
        alert('Error al actualizar la cita. Inténtelo de nuevo.');
      }
    });
  }

  formularioEdicionValido(): boolean {
    return !!(this.citaEditada?.medico && 
              this.citaEditada?.fecha && 
              this.citaEditada?.hora && 
              this.citaEditada?.motivo);
  }

  cancelarCita(cita: Cita): void {
    if (confirm(`¿Estás seguro de que deseas cancelar la cita con ${cita.medico}?`)) {
      this.isLoading = true;
      
      this.citaService.actualizarCita(cita._id, { estado: 'cancelada' }).subscribe({
        next: (citaActualizada) => {
          // Actualizar la cita localmente
          const index = this.citas.findIndex(c => c._id === cita._id);
          if (index !== -1) {
            this.citas[index] = citaActualizada;
          }
          this.calcularContadores();
          this.filtrarCitas();
          this.isLoading = false;
          alert('Cita cancelada exitosamente');
        },
        error: (error) => {
          console.error('Error al cancelar cita:', error);
          this.isLoading = false;
          alert('Error al cancelar la cita. Inténtelo de nuevo.');
        }
      });
    }
  }

  confirmarCita(cita: Cita): void {
    this.isLoading = true;
    
    this.citaService.actualizarCita(cita._id, { estado: 'confirmada' }).subscribe({
      next: (citaActualizada) => {
        // Actualizar la cita localmente
        const index = this.citas.findIndex(c => c._id === cita._id);
        if (index !== -1) {
          this.citas[index] = citaActualizada;
        }
        this.calcularContadores();
        this.filtrarCitas();
        this.isLoading = false;
        alert('Cita confirmada exitosamente');
      },
      error: (error) => {
        console.error('Error al confirmar cita:', error);
        this.isLoading = false;
        alert('Error al confirmar la cita. Inténtelo de nuevo.');
      }
    });
  }

  // Acciones rápidas
  descargarHistorial(): void {
    alert('Función de descarga de historial médico - Disponible próximamente');
  }

  contactarSoporte(): void {
    alert('Función de contacto con soporte - Disponible próximamente');
  }

  verResultados(): void {
    this.router.navigate(['/resultados-medicos']);
  }

  // Utilidades adicionales
  obtenerFechaFormatoInput(fecha: string): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }

  get fechaMinima(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  // Efecto de partículas
  crearEfectoParticulas(event: MouseEvent): void {
    const button = event.target as HTMLElement;
    const btn = button.closest('button') as HTMLButtonElement;
    
    if (!btn) return;

    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.classList.add('button-particle');
      
      const rect = btn.getBoundingClientRect();
      const x = (event.clientX - rect.left) + (Math.random() - 0.5) * 40;
      const y = (event.clientY - rect.top) + (Math.random() - 0.5) * 40;
      
      particle.style.setProperty('--x', `${(Math.random() - 0.5) * 60}px`);
      particle.style.setProperty('--y', `${-Math.random() * 40 - 20}px`);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      const particlesContainer = btn.querySelector('.button-particles') || btn;
      particlesContainer.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1500);
    }
  }

  // Recargar citas
  recargarCitas(): void {
    this.cargarCitas();
  }

  // Cerrar modales con ESC
  onKeydownEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.mostrarModalDetalles) {
        this.cerrarModalDetalles();
      }
      if (this.mostrarModalEdicion) {
        this.cancelarEdicion();
      }
    }
  }
}
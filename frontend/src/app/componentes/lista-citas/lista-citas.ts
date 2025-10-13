import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  medico: string;
  especialidad: string;
  motivo: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  ubicacion: string;
  diagnostico?: string;
  notas?: string;
}

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
  // Datos de ejemplo
  citas: Cita[] = [
    {
      id: '1',
      fecha: '2024-02-15',
      hora: '10:00 AM',
      medico: 'Dr. Carlos Rodríguez',
      especialidad: 'Medicina General',
      motivo: 'Consulta general por dolor de cabeza persistente',
      estado: 'confirmada',
      ubicacion: 'Consultorio 201 - Piso 2'
    },
    {
      id: '2',
      fecha: '2024-02-20',
      hora: '03:30 PM',
      medico: 'Dra. Ana Martínez',
      especialidad: 'Pediatría',
      motivo: 'Control de crecimiento y desarrollo',
      estado: 'pendiente',
      ubicacion: 'Consultorio 105 - Piso 1'
    },
    {
      id: '3',
      fecha: '2024-01-25',
      hora: '09:00 AM',
      medico: 'Dr. Miguel Sánchez',
      especialidad: 'Cardiología',
      motivo: 'Evaluación de presión arterial',
      estado: 'completada',
      ubicacion: 'Consultorio 305 - Piso 3',
      diagnostico: 'Hipertensión controlada',
      notas: 'Continuar con medicación actual y control mensual'
    },
    {
      id: '4',
      fecha: '2024-01-10',
      hora: '11:00 AM',
      medico: 'Dra. Laura García',
      especialidad: 'Dermatología',
      motivo: 'Revisión de lunar en brazo derecho',
      estado: 'completada',
      ubicacion: 'Consultorio 208 - Piso 2',
      diagnostico: 'Nevo melanocítico benigno',
      notas: 'No requiere intervención, control anual'
    }
  ];

  recordatorios: Recordatorio[] = [
    {
      texto: 'Recordatorio: Cita con Dr. Carlos Rodríguez',
      tiempo: 'En 3 días',
      icono: 'fa-calendar-day'
    },
    {
      texto: 'Resultados de laboratorio disponibles',
      tiempo: 'Hace 2 días',
      icono: 'fa-file-medical'
    },
    {
      texto: 'Renovación de medicación próxima',
      tiempo: 'En 1 semana',
      icono: 'fa-pills'
    }
  ];

  filtroEstado: string = 'todas';
  citasFiltradas: Cita[] = [];
  citaSeleccionada: Cita | null = null;
  contadores: Contadores = {
    pendientes: 0,
    confirmadas: 0,
    completadas: 0,
    totales: 0
  };

  constructor(private router: Router) {}

  ngOnInit() {
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

  formatearFechaHora(fecha: string, hora: string): string {
    return `${this.formatearFecha(fecha)} a las ${hora}`;
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

  // Acciones
  irAAgendarCita(): void {
    this.router.navigate(['/agendar-cita']);
  }

  verDetalles(cita: Cita): void {
    this.citaSeleccionada = cita;
    // Aquí podrías abrir un modal con más detalles
    console.log('Ver detalles de cita:', cita);
  }

  editarCita(cita: Cita): void {
    console.log('Editar cita:', cita);
    // Navegar a edición o abrir modal de edición
    alert(`Función de edición para cita con ${cita.medico}`);
  }

  cancelarCita(cita: Cita): void {
    if (confirm(`¿Estás seguro de que deseas cancelar la cita con ${cita.medico}?`)) {
      cita.estado = 'cancelada';
      this.calcularContadores();
      this.filtrarCitas();
      alert('Cita cancelada exitosamente');
    }
  }

  confirmarCita(cita: Cita): void {
    cita.estado = 'confirmada';
    this.calcularContadores();
    this.filtrarCitas();
    alert('Cita confirmada exitosamente');
  }

  cerrarModal(): void {
    this.citaSeleccionada = null;
  }

  // Acciones rápidas
  descargarHistorial(): void {
    alert('Función de descarga de historial médico');
  }

  contactarSoporte(): void {
    alert('Función de contacto con soporte');
  }

  verResultados(): void {
    this.router.navigate(['/resultados-medicos']);
  }

  // Efecto de partículas
  crearEfectoParticulas(event: MouseEvent): void {
    const button = event.target as HTMLButtonElement;
    
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.classList.add('button-particle');
      
      const rect = button.getBoundingClientRect();
      const x = (event.clientX - rect.left) + (Math.random() - 0.5) * 40;
      const y = (event.clientY - rect.top) + (Math.random() - 0.5) * 40;
      
      particle.style.setProperty('--x', `${(Math.random() - 0.5) * 60}px`);
      particle.style.setProperty('--y', `${-Math.random() * 40 - 20}px`);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      const particlesContainer = button.querySelector('.button-particles') || button;
      particlesContainer.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1500);
    }
  }
}
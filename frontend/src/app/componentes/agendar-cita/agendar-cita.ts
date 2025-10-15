import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { CitaService } from '../../servicios/cita.service';
import { CitaDto } from '../../modelos/cita.models';
import { AuthService } from '../../servicios/auth.service';
import { User } from '../../modelos/auth.models';

interface CitaFormData {
  especialidad: string;
  medico: string;
  fecha: string;
  hora: string;
  motivo: string;
}

interface Medico {
  id: string;
  nombre: string;
  especialidad: string;
}

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './agendar-cita.html',
  styleUrls: ['./agendar-cita.css']
})
export class AgendarCita implements OnInit {
  private citaService = inject(CitaService);
  private authService = inject(AuthService);
  private router = inject(Router);

  citaData: CitaFormData = {
    especialidad: '',
    medico: '',
    fecha: '',
    hora: '',
    motivo: ''
  };

  usuarioActual: User | null = null;
  isLoading: boolean = false;
  
  // Datos de ejemplo
  medicosDisponibles: Medico[] = [
    { id: '1', nombre: 'Dr. Carlos Rodríguez', especialidad: 'Medicina General' },
    { id: '2', nombre: 'Dra. Ana Martínez', especialidad: 'Pediatría' },
    { id: '3', nombre: 'Dr. Miguel Sánchez', especialidad: 'Cardiología' },
    { id: '4', nombre: 'Dra. Laura García', especialidad: 'Dermatología' },
    { id: '5', nombre: 'Dra. Elena Torres', especialidad: 'Ginecología' },
    { id: '6', nombre: 'Dr. Roberto Jiménez', especialidad: 'Oftalmología' },
    { id: '7', nombre: 'Dr. Javier López', especialidad: 'Ortopedia' },
    { id: '8', nombre: 'Dra. Carmen Ruiz', especialidad: 'Odontología' }
  ];

  horariosDisponibles: string[] = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Fechas límite
  fechaMinima: string;
  fechaMaxima: string;

  constructor() {
    // Fecha mínima: hoy
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    
    // Fecha máxima: 3 meses desde hoy
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    this.fechaMaxima = maxDate.toISOString().split('T')[0];
  }

  ngOnInit() {
    // Obtener usuario actual al inicializar
    this.usuarioActual = this.authService.getCurrentUser();
    
    if (!this.usuarioActual) {
      alert('Error: No se pudo obtener la información del usuario. Por favor inicie sesión nuevamente.');
      this.router.navigate(['/login']);
      return;
    }

    console.log('Usuario actual:', this.usuarioActual);
  }

  // Métodos de validación (solo los necesarios)
  validarEspecialidad(): boolean {
    return this.citaData.especialidad !== '';
  }

  validarMedico(): boolean {
    return this.citaData.medico !== '';
  }

  validarFecha(): boolean {
    if (!this.citaData.fecha) return false;
    
    const fechaCita = new Date(this.citaData.fecha);
    const hoy = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    
    return fechaCita >= hoy && fechaCita <= maxDate;
  }

  validarHora(): boolean {
    return this.citaData.hora !== '';
  }

  validarMotivo(): boolean {
    return this.citaData.motivo.trim().length >= 10;
  }

  formularioValido(): boolean {
    return this.validarEspecialidad() &&
           this.validarMedico() &&
           this.validarFecha() &&
           this.validarHora() &&
           this.validarMotivo();
  }

  // Métodos auxiliares
  obtenerNombreEspecialidad(especialidadId: string): string {
    const especialidades: { [key: string]: string } = {
      'medicina-general': 'Medicina General',
      'pediatria': 'Pediatría',
      'cardiologia': 'Cardiología',
      'dermatologia': 'Dermatología',
      'ginecologia': 'Ginecología',
      'oftalmologia': 'Oftalmología',
      'ortopedia': 'Ortopedia',
      'odontologia': 'Odontología'
    };
    return especialidades[especialidadId] || 'No seleccionada';
  }

  obtenerNombreMedico(medicoId: string): string {
    const medico = this.medicosDisponibles.find(m => m.id === medicoId);
    return medico ? medico.nombre : 'No seleccionado';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'No seleccionada';
    
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  }

  // Crear fecha ISO combinando fecha y hora
  crearFechaISO(fecha: string, hora: string): string {
    return `${fecha}T${hora}:00`;
  }

  // Acciones del formulario
  onSubmit(): void {
    if (!this.formularioValido()) {
      alert('Por favor complete todos los campos correctamente.');
      return;
    }

    if (!this.usuarioActual) {
      alert('Error: No se pudo obtener la información del usuario.');
      return;
    }

    this.isLoading = true;

    // Crear el DTO para la cita
    const citaDto: CitaDto = {
      paciente: this.usuarioActual.id, // Usar el ID del usuario actual como paciente
      fecha: this.crearFechaISO(this.citaData.fecha, this.citaData.hora),
      motivo: this.citaData.motivo,
      estado: 'pendiente',
      medico: this.obtenerNombreMedico(this.citaData.medico)
    };

    console.log('Enviando cita:', citaDto);

    // Llamar al servicio real
    this.citaService.crearCita(citaDto).subscribe({
      next: (citaCreada) => {
        this.isLoading = false;
        console.log('Cita creada exitosamente:', citaCreada);
        
        // Mostrar mensaje de éxito
        alert('¡Cita agendada exitosamente! Serás redirigido al inicio.');
        
        // Redirigir al inicio después de agendar
        setTimeout(() => {
          this.router.navigate(['/inicio']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al crear cita:', error);
        
        // Mostrar mensaje de error específico
        let mensajeError = 'Error al agendar la cita. Inténtelo de nuevo.';
        
        if (error.message?.includes('400')) {
          mensajeError = 'Datos inválidos. Por favor verifique la información.';
        } else if (error.message?.includes('401')) {
          mensajeError = 'No tiene permisos para realizar esta acción.';
        }
        
        alert(mensajeError);
      }
    });
  }

  limpiarFormulario(): void {
    this.citaData = {
      especialidad: '',
      medico: '',
      fecha: '',
      hora: '',
      motivo: ''
    };
  }

  // Efecto de partículas para el botón
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
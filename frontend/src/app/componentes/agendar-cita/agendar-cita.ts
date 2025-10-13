import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';

interface CitaData {
  nombre: string;
  email: string;
  telefono: string;
  edad: number | null;
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
  citaData: CitaData = {
    nombre: '',
    email: '',
    telefono: '',
    edad: null,
    especialidad: '',
    medico: '',
    fecha: '',
    hora: '',
    motivo: ''
  };

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
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
  ];

  // Fechas límite
  fechaMinima: string;
  fechaMaxima: string;

  constructor(private router: Router) {
    // Fecha mínima: hoy
    const hoy = new Date();
    this.fechaMinima = hoy.toISOString().split('T')[0];
    
    // Fecha máxima: 3 meses desde hoy
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    this.fechaMaxima = maxDate.toISOString().split('T')[0];
  }

  ngOnInit() {
    // Inicializar datos si es necesario
  }

  // Métodos de validación
  validarNombre(): boolean {
    return this.citaData.nombre.trim().length >= 2;
  }

  validarEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.citaData.email);
  }

  validarTelefono(): boolean {
    const telefonoRegex = /^[0-9+\-\s()]{10,}$/;
    return telefonoRegex.test(this.citaData.telefono);
  }

  validarEdad(): boolean {
    return this.citaData.edad !== null && this.citaData.edad >= 1 && this.citaData.edad <= 120;
  }

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
    return this.validarNombre() &&
           this.validarEmail() &&
           this.validarTelefono() &&
           this.validarEdad() &&
           this.validarEspecialidad() &&
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

  // Acciones del formulario
  onSubmit(): void {
    if (!this.formularioValido()) {
      return;
    }

    this.isLoading = true;

    // Simular procesamiento de la cita
    setTimeout(() => {
      this.isLoading = false;
      
      // Aquí iría la lógica real para guardar la cita
      console.log('Cita agendada:', this.citaData);
      
      // Mostrar mensaje de éxito y redirigir
      alert('¡Cita agendada exitosamente! Serás redirigido al inicio.');
      
      // Redirigir al inicio después de agendar
      setTimeout(() => {
        this.router.navigate(['/inicio']);
      }, 2000);
      
    }, 2000);
  }

  limpiarFormulario(): void {
    this.citaData = {
      nombre: '',
      email: '',
      telefono: '',
      edad: null,
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
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';

interface ValorResultado {
  nombre: string;
  resultado: string;
  unidad: string;
  rangoNormal: string;
  estado: 'normal' | 'anormal';
}

interface ResultadoMedico {
  id: string;
  nombreExamen: string;
  tipo: 'laboratorio' | 'imagen' | 'especialidad' | 'general';
  fechaExamen: string;
  fechaResultado: string;
  medicoSolicitante: string;
  laboratorio: string;
  estado: 'normal' | 'anormal' | 'pendiente';
  valores?: ValorResultado[];
  observaciones?: string;
}

interface Alerta {
  id: string;
  mensaje: string;
  nivel: 'alta' | 'media' | 'baja';
  fecha: string;
}

interface ExamenPendiente {
  id: string;
  nombre: string;
  instrucciones: string;
  fechaProgramada: string;
}

interface Contadores {
  totales: number;
  normales: number;
  anormales: number;
  pendientes: number;
}

@Component({
  selector: 'app-resultados-medicos',
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar],
  templateUrl: './resultados-medicos.html',
  styleUrls: ['./resultados-medicos.css']
})
export class ResultadosMedicos implements OnInit {
  // Datos de ejemplo
  resultados: ResultadoMedico[] = [
    {
      id: '1',
      nombreExamen: 'Hemograma Completo',
      tipo: 'laboratorio',
      fechaExamen: '2024-02-10',
      fechaResultado: '2024-02-11',
      medicoSolicitante: 'Dr. Carlos Rodríguez',
      laboratorio: 'Laboratorio Central',
      estado: 'normal',
      valores: [
        { nombre: 'Hemoglobina', resultado: '14.2', unidad: 'g/dL', rangoNormal: '13.5-17.5', estado: 'normal' },
        { nombre: 'Leucocitos', resultado: '7.8', unidad: 'x10³/μL', rangoNormal: '4.5-11.0', estado: 'normal' },
        { nombre: 'Plaquetas', resultado: '250', unidad: 'x10³/μL', rangoNormal: '150-450', estado: 'normal' }
      ],
      observaciones: 'Resultados dentro de parámetros normales.'
    },
    {
      id: '2',
      nombreExamen: 'Perfil Lipídico',
      tipo: 'laboratorio',
      fechaExamen: '2024-02-10',
      fechaResultado: '2024-02-11',
      medicoSolicitante: 'Dr. Carlos Rodríguez',
      laboratorio: 'Laboratorio Central',
      estado: 'anormal',
      valores: [
        { nombre: 'Colesterol Total', resultado: '240', unidad: 'mg/dL', rangoNormal: '<200', estado: 'anormal' },
        { nombre: 'LDL', resultado: '160', unidad: 'mg/dL', rangoNormal: '<100', estado: 'anormal' },
        { nombre: 'HDL', resultado: '45', unidad: 'mg/dL', rangoNormal: '>40', estado: 'normal' },
        { nombre: 'Triglicéridos', resultado: '180', unidad: 'mg/dL', rangoNormal: '<150', estado: 'anormal' }
      ],
      observaciones: 'Niveles elevados de colesterol y triglicéridos. Se recomienda consulta con especialista.'
    },
    {
      id: '3',
      nombreExamen: 'Radiografía de Tórax',
      tipo: 'imagen',
      fechaExamen: '2024-02-05',
      fechaResultado: '2024-02-06',
      medicoSolicitante: 'Dra. Ana Martínez',
      laboratorio: 'Imagenología Avanzada',
      estado: 'normal',
      observaciones: 'Radiografía sin hallazgos patológicos. Campos pulmonares libres.'
    },
    {
      id: '4',
      nombreExamen: 'Electrocardiograma',
      tipo: 'especialidad',
      fechaExamen: '2024-01-20',
      fechaResultado: '2024-01-20',
      medicoSolicitante: 'Dr. Miguel Sánchez',
      laboratorio: 'Cardiología Clínica',
      estado: 'normal',
      observaciones: 'Ritmo sinusal normal. Sin alteraciones significativas.'
    },
    {
      id: '5',
      nombreExamen: 'Perfil Tiroideo',
      tipo: 'laboratorio',
      fechaExamen: '2024-02-12',
      fechaResultado: '2024-02-12',
      medicoSolicitante: 'Dr. Carlos Rodríguez',
      laboratorio: 'Laboratorio Central',
      estado: 'pendiente',
      observaciones: 'Resultados en proceso de validación.'
    }
  ];

  alertasImportantes: Alerta[] = [
    {
      id: '1',
      mensaje: 'Colesterol LDL elevado requiere atención médica',
      nivel: 'alta',
      fecha: '2024-02-11'
    },
    {
      id: '2',
      mensaje: 'Triglicéridos por encima del rango normal',
      nivel: 'media',
      fecha: '2024-02-11'
    },
    {
      id: '3',
      mensaje: 'Próximo control de perfil lipídico en 3 meses',
      nivel: 'baja',
      fecha: '2024-02-11'
    }
  ];

  examenesPendientes: ExamenPendiente[] = [
    {
      id: '1',
      nombre: 'Ecografía Abdominal',
      instrucciones: 'Ayuno de 8 horas antes del examen',
      fechaProgramada: '2024-02-20'
    },
    {
      id: '2',
      nombre: 'Prueba de Esfuerzo',
      instrucciones: 'Usar ropa deportiva y zapatos cómodos',
      fechaProgramada: '2024-02-25'
    }
  ];

  terminoBusqueda: string = '';
  filtroTipo: string = 'todos';
  filtroEstado: string = 'todos';
  resultadosFiltrados: ResultadoMedico[] = [];
  resultadoSeleccionado: ResultadoMedico | null = null;
  contadores: Contadores = {
    totales: 0,
    normales: 0,
    anormales: 0,
    pendientes: 0
  };

  constructor(private router: Router) {}

  ngOnInit() {
    this.calcularContadores();
    this.filtrarResultados();
  }

  // Filtros y búsqueda
  filtrarResultados(): void {
    let filtered = [...this.resultados];

    // Filtro por tipo
    if (this.filtroTipo !== 'todos') {
      filtered = filtered.filter(resultado => resultado.tipo === this.filtroTipo);
    }

    // Filtro por estado
    if (this.filtroEstado !== 'todos') {
      filtered = filtered.filter(resultado => resultado.estado === this.filtroEstado);
    }

    // Filtro por búsqueda
    if (this.terminoBusqueda) {
      const searchTerm = this.terminoBusqueda.toLowerCase();
      filtered = filtered.filter(resultado =>
        resultado.nombreExamen.toLowerCase().includes(searchTerm) ||
        resultado.medicoSolicitante.toLowerCase().includes(searchTerm) ||
        resultado.laboratorio.toLowerCase().includes(searchTerm)
      );
    }

    this.resultadosFiltrados = filtered;
  }

  // Cálculo de estadísticas
  calcularContadores(): void {
    this.contadores.totales = this.resultados.length;
    this.contadores.normales = this.resultados.filter(r => r.estado === 'normal').length;
    this.contadores.anormales = this.resultados.filter(r => r.estado === 'anormal').length;
    this.contadores.pendientes = this.resultados.filter(r => r.estado === 'pendiente').length;
  }

  // Getters para datos procesados
  get resultadosRecientes(): ResultadoMedico[] {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    return this.resultadosFiltrados
      .filter(resultado => new Date(resultado.fechaExamen) >= hace30Dias)
      .sort((a, b) => new Date(b.fechaExamen).getTime() - new Date(a.fechaExamen).getTime());
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

  formatearFechaCorta(fecha: string): string {
    const opciones: Intl.DateTimeFormatOptions = { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  }

  // Utilidades de iconos y textos
  getTipoIcono(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'laboratorio': 'fa-flask',
      'imagen': 'fa-x-ray',
      'especialidad': 'fa-stethoscope',
      'general': 'fa-user-md'
    };
    return iconos[tipo] || 'fa-file-medical';
  }

  getTipoTexto(tipo: string): string {
    const textos: { [key: string]: string } = {
      'laboratorio': 'Laboratorio',
      'imagen': 'Imágenes',
      'especialidad': 'Especialidad',
      'general': 'Medicina General'
    };
    return textos[tipo] || tipo;
  }

  getEstadoIcono(estado: string): string {
    const iconos: { [key: string]: string } = {
      'normal': 'fa-check-circle',
      'anormal': 'fa-exclamation-triangle',
      'pendiente': 'fa-clock'
    };
    return iconos[estado] || 'fa-question-circle';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'normal': 'Dentro de Rango',
      'anormal': 'Fuera de Rango',
      'pendiente': 'Pendiente'
    };
    return textos[estado] || estado;
  }

  getValorIcono(estado: string): string {
    return estado === 'normal' ? 'fa-check' : 'fa-exclamation';
  }

  getAlertaIcono(nivel: string): string {
    const iconos: { [key: string]: string } = {
      'alta': 'fa-exclamation-circle',
      'media': 'fa-exclamation-triangle',
      'baja': 'fa-info-circle'
    };
    return iconos[nivel] || 'fa-bell';
  }

  // Acciones
  verDetalles(resultado: ResultadoMedico): void {
    this.resultadoSeleccionado = resultado;
    console.log('Ver detalles de resultado:', resultado);
    // Aquí podrías abrir un modal con más detalles
    alert(`Mostrando detalles de: ${resultado.nombreExamen}`);
  }

  descargarResultado(resultado: ResultadoMedico): void {
    console.log('Descargando resultado:', resultado);
    alert(`Descargando PDF de: ${resultado.nombreExamen}`);
  }

  compartirResultado(resultado: ResultadoMedico): void {
    console.log('Compartiendo resultado:', resultado);
    alert(`Compartiendo resultado: ${resultado.nombreExamen}`);
  }

  cerrarModal(): void {
    this.resultadoSeleccionado = null;
  }

  limpiarFiltros(): void {
    this.terminoBusqueda = '';
    this.filtroTipo = 'todos';
    this.filtroEstado = 'todos';
    this.filtrarResultados();
  }

  // Acciones rápidas
  descargarHistorialCompleto(): void {
    alert('Descargando historial médico completo en PDF');
  }

  compartirConMedico(): void {
    alert('Compartiendo resultados con médico especialista');
  }

  solicitarNuevoExamen(): void {
    this.router.navigate(['/agendar-cita']);
  }

  verAlerta(alerta: Alerta): void {
    console.log('Ver alerta:', alerta);
    alert(`Alerta: ${alerta.mensaje}`);
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
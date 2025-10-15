import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../navbar/navbar';
import { ResultadoService } from '../../servicios/resultado.service';
import { AuthService } from '../../servicios/auth.service';
import { Resultado, ResultadoDto, ResultadoFiltros } from '../../modelos/resultado.models';
import { User } from '../../modelos/auth.models';

interface ValorResultado {
  nombre: string;
  resultado: string;
  unidad: string;
  rangoNormal: string;
  estado: 'normal' | 'anormal';
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
  private resultadoService = inject(ResultadoService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Datos reales
  resultados: Resultado[] = [];
  usuarioActual: User | null = null;

  // Datos estáticos (pueden venir de otro servicio)
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
    }
  ];

  examenesPendientes: ExamenPendiente[] = [
    {
      id: '1',
      nombre: 'Ecografía Abdominal',
      instrucciones: 'Ayuno de 8 horas antes del examen',
      fechaProgramada: '2024-02-20'
    }
  ];

  terminoBusqueda: string = '';
  filtroTipo: string = 'todos';
  filtroEstado: string = 'todos';
  resultadosFiltrados: any[] = [];
  resultadoSeleccionado: any = null;
  contadores: Contadores = {
    totales: 0,
    normales: 0,
    anormales: 0,
    pendientes: 0
  };

  isLoading: boolean = true;
  errorMessage: string = '';

  constructor() {}

  ngOnInit() {
    this.usuarioActual = this.authService.getCurrentUser();
    
    if (!this.usuarioActual) {
      this.errorMessage = 'No se pudo obtener la información del usuario.';
      this.isLoading = false;
      return;
    }

    this.cargarResultados();
  }

  // Cargar resultados del servicio
  cargarResultados(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filtros: ResultadoFiltros = { paciente: this.usuarioActual?.id };

    this.resultadoService.listarResultados(filtros).subscribe({
      next: (resultados) => {
        this.resultados = resultados;
        this.procesarResultados();
        this.calcularContadores();
        this.filtrarResultados();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar resultados:', error);
        this.errorMessage = 'Error al cargar los resultados médicos. Inténtelo de nuevo.';
        this.isLoading = false;
        
        // Datos de ejemplo en caso de error (solo para desarrollo)
        this.cargarResultadosDeEjemplo();
      }
    });
  }

  // Procesar resultados para adaptarlos a la interfaz de la vista
  private procesarResultados(): void {
    this.resultadosFiltrados = this.resultados.map(resultado => ({
      id: resultado._id,
      nombreExamen: this.obtenerNombreExamen(resultado.tipo),
      tipo: this.mapearTipo(resultado.tipo),
      fechaExamen: resultado.fechaResultado,
      fechaResultado: resultado.fechaResultado,
      medicoSolicitante: 'Dr. Especialista', // Puedes obtener esto de otro servicio
      laboratorio: 'Laboratorio Clínico', // Puedes obtener esto de otro servicio
      estado: this.determinarEstado(resultado),
      valores: this.extraerValores(resultado),
      observaciones: resultado.descripcion,
      archivoUrl: resultado.archivoUrl,
      resultadoOriginal: resultado // Guardar el resultado original para referencia
    }));
  }

  private obtenerNombreExamen(tipo: string): string {
    const nombres: { [key: string]: string } = {
      'hemograma': 'Hemograma Completo',
      'perfil_lipidico': 'Perfil Lipídico',
      'glucosa': 'Glucosa en Sangre',
      'tiroides': 'Perfil Tiroideo',
      'hepatico': 'Perfil Hepático',
      'renal': 'Perfil Renal',
      'orina': 'Análisis de Orina',
      'heces': 'Análisis de Heces',
      'radiografia': 'Radiografía',
      'ecografia': 'Ecografía',
      'tomografia': 'Tomografía',
      'resonancia': 'Resonancia Magnética'
    };
    return nombres[tipo] || `Examen de ${tipo}`;
  }

  private mapearTipo(tipo: string): 'laboratorio' | 'imagen' | 'especialidad' | 'general' {
    const tiposLaboratorio = ['hemograma', 'perfil_lipidico', 'glucosa', 'tiroides', 'hepatico', 'renal', 'orina', 'heces'];
    const tiposImagen = ['radiografia', 'ecografia', 'tomografia', 'resonancia'];
    
    if (tiposLaboratorio.includes(tipo)) return 'laboratorio';
    if (tiposImagen.includes(tipo)) return 'imagen';
    if (tipo.includes('especialidad')) return 'especialidad';
    return 'general';
  }

  private determinarEstado(resultado: Resultado): 'normal' | 'anormal' | 'pendiente' {
    // Lógica para determinar el estado basado en la descripción o valores
    const descripcion = resultado.descripcion.toLowerCase();
    
    if (descripcion.includes('normal') || descripcion.includes('dentro de parámetros')) {
      return 'normal';
    } else if (descripcion.includes('elevado') || descripcion.includes('anormal') || descripcion.includes('alterado')) {
      return 'anormal';
    } else {
      return 'pendiente';
    }
  }

  private extraerValores(resultado: Resultado): ValorResultado[] {
    // Esta es una implementación básica. Puedes mejorar según tu estructura de datos
    // o crear un campo específico para valores en el modelo Resultado
    const valores: ValorResultado[] = [];
    
    // Ejemplo de extracción de valores desde la descripción
    // En una implementación real, tendrías un campo separado para los valores
    if (resultado.tipo === 'hemograma') {
      valores.push(
        { nombre: 'Hemoglobina', resultado: '14.2', unidad: 'g/dL', rangoNormal: '13.5-17.5', estado: 'normal' },
        { nombre: 'Leucocitos', resultado: '7.8', unidad: 'x10³/μL', rangoNormal: '4.5-11.0', estado: 'normal' }
      );
    } else if (resultado.tipo === 'perfil_lipidico') {
      valores.push(
        { nombre: 'Colesterol Total', resultado: '240', unidad: 'mg/dL', rangoNormal: '<200', estado: 'anormal' },
        { nombre: 'HDL', resultado: '45', unidad: 'mg/dL', rangoNormal: '>40', estado: 'normal' }
      );
    }
    
    return valores;
  }

  // Datos de ejemplo para desarrollo
  private cargarResultadosDeEjemplo(): void {
    this.resultados = [
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
        tipo: 'hemograma',
        descripcion: 'Resultados dentro de parámetros normales. Hemoglobina 14.2 g/dL, Leucocitos 7.8 x10³/μL.',
        fechaResultado: new Date().toISOString(),
        archivoUrl: 'https://ejemplo.com/resultado1.pdf',
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
        tipo: 'perfil_lipidico',
        descripcion: 'Colesterol elevado. Se recomienda consulta con especialista. Colesterol Total: 240 mg/dL.',
        fechaResultado: new Date(Date.now() - 86400000).toISOString(),
        archivoUrl: 'https://ejemplo.com/resultado2.pdf',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    this.procesarResultados();
    this.calcularContadores();
    this.filtrarResultados();
  }

  // Filtros y búsqueda
  filtrarResultados(): void {
    let filtered = [...this.resultadosFiltrados];

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
        resultado.laboratorio.toLowerCase().includes(searchTerm) ||
        resultado.resultadoOriginal.descripcion.toLowerCase().includes(searchTerm)
      );
    }

    this.resultadosFiltrados = filtered;
  }

  // Cálculo de estadísticas
  calcularContadores(): void {
    this.contadores.totales = this.resultadosFiltrados.length;
    this.contadores.normales = this.resultadosFiltrados.filter(r => r.estado === 'normal').length;
    this.contadores.anormales = this.resultadosFiltrados.filter(r => r.estado === 'anormal').length;
    this.contadores.pendientes = this.resultadosFiltrados.filter(r => r.estado === 'pendiente').length;
  }

  // Getters para datos procesados
  get resultadosRecientes(): any[] {
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
  verDetalles(resultado: any): void {
    this.resultadoSeleccionado = resultado;
    console.log('Ver detalles de resultado:', resultado);
    // Aquí podrías abrir un modal con más detalles
    alert(`Mostrando detalles de: ${resultado.nombreExamen}`);
  }

  descargarResultado(resultado: any): void {
    if (resultado.archivoUrl) {
      // Descargar el archivo real si existe
      window.open(resultado.archivoUrl, '_blank');
    } else {
      console.log('Descargando resultado:', resultado);
      alert(`Descargando PDF de: ${resultado.nombreExamen}`);
    }
  }

  compartirResultado(resultado: any): void {
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

  // Recargar resultados
  recargarResultados(): void {
    this.cargarResultados();
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
}
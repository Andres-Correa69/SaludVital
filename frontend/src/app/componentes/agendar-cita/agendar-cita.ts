import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CitasService, NuevaCitaDTO } from '../../servicios/citas.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agendar-cita.html',
  styleUrls: ['./agendar-cita.css']
})
export class AgendarCitaComponent {
  nuevaCita: NuevaCitaDTO = {
    fecha: new Date(),
    especialidad: '',
    descripcion: ''
  };
  errorMessage: string = '';
  successMessage: string = '';
  
  // Lista de especialidades para el formulario
  especialidades: string[] = [
    'Medicina General', 
    'Cardiología', 
    'Dermatología', 
    'Pediatría', 
    'Ginecología', 
    'Oftalmología'
  ];

  constructor(
    private citasService: CitasService,
    private router: Router
  ) { }

  onAgendarCita(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.citasService.agendarCita(this.nuevaCita).subscribe({
      next: (response) => {
        this.successMessage = '¡Cita agendada con éxito! Serás redirigido en unos segundos.';
        setTimeout(() => {
          this.router.navigate(['/lista-citas']);
        }, 2500);
      },
      error: (err) => {
        console.error('Error al agendar la cita', err);
        this.errorMessage = 'No se pudo agendar la cita. Por favor, verifica los datos e intenta de nuevo.';
      }
    });
  }
}

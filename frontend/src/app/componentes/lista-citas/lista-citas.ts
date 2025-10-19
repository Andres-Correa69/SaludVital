import { Component, OnInit } from '@angular/core';
import { CitasService, Cita } from '../../servicios/citas.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-lista-citas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lista-citas.html',
  styleUrls: ['./lista-citas.css']
})
export class ListaCitasComponent implements OnInit {
  citas: Cita[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private citasService: CitasService) { }

  ngOnInit(): void {
    this.citasService.getCitas().subscribe({
      next: (data) => {
        this.citas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener las citas', err);
        this.errorMessage = 'No se pudieron cargar las citas. Por favor, intente más tarde.';
        this.isLoading = false;
      }
    });
  }
}

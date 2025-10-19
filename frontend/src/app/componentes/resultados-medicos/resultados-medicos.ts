import { Component, OnInit } from '@angular/core';
import { ResultadosService, Resultado } from '../../servicios/resultados.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-resultados-medicos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultados-medicos.html',
  styleUrls: ['./resultados-medicos.css']
})
export class ResultadosMedicosComponent implements OnInit {
  resultados: Resultado[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private resultadosService: ResultadosService) { }

  ngOnInit(): void {
    this.resultadosService.getResultados().subscribe({
      next: (data) => {
        this.resultados = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener los resultados médicos', err);
        this.errorMessage = 'No se pudieron cargar los resultados. Por favor, intente más tarde.';
        this.isLoading = false;
      }
    });
  }
}

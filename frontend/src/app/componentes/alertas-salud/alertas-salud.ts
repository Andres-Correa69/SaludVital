import { Component, OnInit } from '@angular/core';
import { AlertasService, Alerta } from '../../servicios/alertas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alertas-salud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alertas-salud.html',
  styleUrls: ['./alertas-salud.css']
})
export class AlertasSaludComponent implements OnInit {
  alertas: Alerta[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(private alertasService: AlertasService) { }

  ngOnInit(): void {
    this.alertasService.getAlertas().subscribe({
      next: (data) => {
        this.alertas = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener las alertas', err);
        this.errorMessage = 'No se pudieron cargar las alertas de salud. Intente más tarde.';
        this.isLoading = false;
      }
    });
  }
}
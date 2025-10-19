import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PacientesService, Paciente } from '../../servicios/pacientes.service';
import { AuthService } from '../../servicios/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  perfil: Paciente | null = null;
  errorMessage: string = '';

  constructor(
    private pacientesService: PacientesService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.pacientesService.getMiPerfil().subscribe({
      next: (data) => {
        this.perfil = data;
      },
      error: (err) => {
        console.error('Error al obtener el perfil', err);
        this.errorMessage = 'No se pudo cargar la información del perfil. Por favor, intente iniciar sesión de nuevo.';
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../servicios/auth.service';

@Component({
  selector: 'app-navbar-medico',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-medico.html',
  styleUrls: ['./navbar-medico.css']
})
export class NavbarMedicoComponent implements OnInit {
  seccionActiva: string = 'dashboard';
  nombreUsuario: string = 'Médico';
  usuarioActual: any;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener el usuario actual del servicio de autenticación
    this.usuarioActual = this.authService.getCurrentUser();
    if (this.usuarioActual) {
      this.nombreUsuario = `Dr. ${this.usuarioActual.nombre}`;
    }
    
    // Determinar la sección activa basada en la ruta actual
    this.determinarSeccionActiva();
  }

  private determinarSeccionActiva(): void {
    const currentRoute = this.router.url;
    
    if (currentRoute.includes('dashboard') || currentRoute.includes('medico')) {
      this.seccionActiva = 'dashboard';
    } else if (currentRoute.includes('citas')) {
      this.seccionActiva = 'citas';
    } else if (currentRoute.includes('pacientes')) {
      this.seccionActiva = 'pacientes';
    } else if (currentRoute.includes('resultados')) {
      this.seccionActiva = 'resultados';
    } else if (currentRoute.includes('perfil')) {
      this.seccionActiva = 'perfil';
    }
  }

  irADashboard(): void {
    this.seccionActiva = 'dashboard';
    this.router.navigate(['/medico/dashboard']);
    this.crearEfectoParticulas('dashboard');
  }

  irACitas(): void {
    this.seccionActiva = 'citas';
    this.router.navigate(['/medico/citas']);
    this.crearEfectoParticulas('citas');
  }

  irAPacientes(): void {
    this.seccionActiva = 'pacientes';
    this.router.navigate(['/medico/pacientes']);
    this.crearEfectoParticulas('pacientes');
  }

  irAResultados(): void {
    this.seccionActiva = 'resultados';
    this.router.navigate(['/medico/resultados']);
    this.crearEfectoParticulas('resultados');
  }

  irAPerfil(): void {
    this.seccionActiva = 'perfil';
    this.router.navigate(['/medico/perfil']);
    this.crearEfectoParticulas('perfil');
  }

  salir(): void {
    // Crear efecto de partículas antes de salir
    this.crearEfectoParticulas('salir');
    
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/login']);
    }, 500);
  }

  private crearEfectoParticulas(tipo: string): void {
    const buttons = document.querySelectorAll(`.nav-link, .logout-btn`);
    
    buttons.forEach((button: Element) => {
      if ((button as HTMLElement).classList.contains('active') || 
          (tipo === 'salir' && button.classList.contains('logout-btn'))) {
        
        for (let i = 0; i < 6; i++) {
          const particle = document.createElement('div');
          particle.classList.add('button-particle');
          
          // Posición aleatoria
          const x = Math.random() * 100;
          const y = Math.random() * 100;
          
          particle.style.setProperty('--x', `${(Math.random() - 0.5) * 40}px`);
          particle.style.setProperty('--y', `${-Math.random() * 30 - 10}px`);
          particle.style.left = `${x}%`;
          particle.style.top = `${y}%`;
          
          const particlesContainer = button.querySelector('.button-particles') || button;
          particlesContainer.appendChild(particle);
          
          // Remover la partícula después de la animación
          setTimeout(() => {
            if (particle.parentNode) {
              particle.parentNode.removeChild(particle);
            }
          }, 1500);
        }
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  seccionActiva: string = 'agendar';
  nombreUsuario: string = 'Usuario';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Obtener el usuario actual del servicio de autenticación
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.nombreUsuario = currentUser.nombre;
    }
    
    // Determinar la sección activa basada en la ruta actual
    this.determinarSeccionActiva();
  }

  private determinarSeccionActiva(): void {
    const currentRoute = this.router.url;
    
    if (currentRoute.includes('agendar')) {
      this.seccionActiva = 'agendar';
    } else if (currentRoute.includes('citas')) {
      this.seccionActiva = 'citas';
    } else if (currentRoute.includes('resultados')) {
      this.seccionActiva = 'resultados';
    } else if (currentRoute.includes('perfil')) {
      this.seccionActiva = 'perfil';
    }
  }

  irAAgendarCita(): void {
    this.seccionActiva = 'agendar';
    this.router.navigate(['/agendar-cita']);
    this.crearEfectoParticulas('agendar');
  }

  irAListaCitas(): void {
    this.seccionActiva = 'citas';
    this.router.navigate(['/lista-citas']);
    this.crearEfectoParticulas('citas');
  }

  irAResultados(): void {
    this.seccionActiva = 'resultados';
    this.router.navigate(['/resultados-medicos']);
    this.crearEfectoParticulas('resultados');
  }

  irAPerfil(): void {
    this.seccionActiva = 'perfil';
    this.router.navigate(['/perfil']);
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
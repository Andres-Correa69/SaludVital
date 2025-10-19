import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../navbar/navbar';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, Navbar],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css']
})
export class InicioComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    // Efectos de partículas al cargar la página
    setTimeout(() => {
      this.crearEfectoBienvenida();
    }, 1000);
  }

  irAAgendarCita(): void {
    this.crearEfectoParticulas('agendar');
    setTimeout(() => {
      this.router.navigate(['/agendar-cita']);
    }, 500);
  }

  irAResultados(): void {
    this.crearEfectoParticulas('resultados');
    setTimeout(() => {
      this.router.navigate(['/resultados-medicos']);
    }, 500);
  }

  private crearEfectoBienvenida(): void {
    // Crear partículas de bienvenida en el hero section
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      for (let i = 0; i < 15; i++) {
        this.crearParticula(heroSection);
      }
    }
  }

  private crearEfectoParticulas(tipo: string): void {
    const buttons = document.querySelectorAll('.btn-primary, .btn-cta');
    
    buttons.forEach((button: Element) => {
      for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        particle.classList.add('button-particle');
        
        // Posición aleatoria
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        particle.style.setProperty('--x', `${(Math.random() - 0.5) * 60}px`);
        particle.style.setProperty('--y', `${-Math.random() * 40 - 20}px`);
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
    });
  }

  private crearParticula(container: Element): void {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      pointer-events: none;
      animation: floatParticle 15s infinite ease-in-out;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
    `;
    
    container.appendChild(particle);
    
    // Remover después de la animación
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 15000);
  }
}
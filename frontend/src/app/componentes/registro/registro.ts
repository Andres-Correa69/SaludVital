import { Component, ElementRef, AfterViewInit, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';

interface RegisterDto {
  email: string;
  password: string;
  nombre: string;
}

interface User {
  id: string;
  email: string;
  nombre: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro implements OnInit, AfterViewInit, OnDestroy {
  // Campos del formulario
  nombre: string = '';
  email: string = '';
  contrasena: string = '';
  confirmarContrasena: string = '';
  
  // Términos
  aceptoTerminos: boolean = false;
  
  // Estados
  isLoading: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  successMessage: string = '';
  showSuccess: boolean = false;
  
  private hasSwapped: boolean = false;
  private routerSubscription: Subscription;

  @ViewChild('registerForm') registerForm: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private route: ActivatedRoute
  ) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.url.includes('/registro')) {
          this.clearMessages();
        }
      }
    });
  }

  ngOnInit() {
    this.clearMessages();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSmoothSwap();
    }, 500);
  }

  private initSmoothSwap(): void {
    const registerContainer = this.elementRef.nativeElement.querySelector('.register-container');
    
    if (registerContainer && !this.hasSwapped) {
      registerContainer.classList.add('swap-init');
      
      setTimeout(() => {
        registerContainer.classList.remove('swap-init');
        registerContainer.classList.add('swap-completed');
        this.hasSwapped = true;
        this.activateButtonParticles();
      }, 800);
    }
  }

  private activateButtonParticles(): void {
    const buttons = this.elementRef.nativeElement.querySelectorAll('button[type="submit"]');
    buttons.forEach((button: HTMLButtonElement) => {
      button.addEventListener('click', this.createButtonParticles.bind(this));
    });
  }

  private createButtonParticles(event: MouseEvent): void {
    const button = event.target as HTMLButtonElement;
    const rect = button.getBoundingClientRect();
    
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.classList.add('button-particle');
      
      // Posición aleatoria desde el punto de clic
      const x = (event.clientX - rect.left) + (Math.random() - 0.5) * 40;
      const y = (event.clientY - rect.top) + (Math.random() - 0.5) * 40;
      
      particle.style.setProperty('--x', `${(Math.random() - 0.5) * 60}px`);
      particle.style.setProperty('--y', `${-Math.random() * 40 - 20}px`);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      button.appendChild(particle);
      
      // Remover la partícula después de la animación
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1500);
    }
  }

  onRegister(): void {
    if (!this.isFormValid()) {
      this.showErrorAlert('Por favor completa todos los campos requeridos correctamente');
      return;
    }

    if (!this.aceptoTerminos) {
      this.showErrorAlert('Debes aceptar los términos y condiciones');
      return;
    }

    this.isLoading = true;
    this.clearMessages();

    // Crear el DTO para el registro
    const registerDto: RegisterDto = {
      email: this.email.trim(),
      password: this.contrasena,
      nombre: this.nombre.trim()
    };

    // Llamar al servicio de autenticación
    this.authService.register(registerDto).subscribe({
      next: (response: AuthResponse | null) => {
        this.isLoading = false;
        
        // Verificar si la respuesta es válida (no es null)
        if (response && response.user && response.token) {
          this.handleRegistrationSuccess();
        } else {
          this.showErrorAlert('El email ya está registrado. Por favor usa otro email.');
        }
      },
      error: (error) => {
        this.isLoading = false;
        
        // Manejar diferentes tipos de errores
        if (error.status === 409) {
          this.showErrorAlert('El email ya está registrado. Por favor usa otro email.');
        } else if (error.status === 400) {
          this.showErrorAlert('Datos inválidos. Por favor verifica la información.');
        } else {
          this.showErrorAlert('Error al crear la cuenta. Inténtalo de nuevo.');
        }
        
        console.error('Error en registro:', error);
      }
    });
  }

  private handleRegistrationSuccess(): void {
    this.showSuccessAlert('¡Cuenta creada exitosamente! Serás redirigido al inicio de sesión...');
    
    setTimeout(() => {
      this.router.navigate(['/login'], { 
        queryParams: { registered: 'true' } 
      });
    }, 2000);
  }

  private showErrorAlert(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  private showSuccessAlert(message: string): void {
    this.successMessage = message;
    this.showSuccess = true;
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.showError = false;
    this.successMessage = '';
    this.showSuccess = false;
  }

  private clearError(): void {
    this.errorMessage = '';
    this.showError = false;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onRegister();
    }
  }

  onInputChange(): void {
    if (this.showError) {
      this.clearError();
    }
  }

  goToLogin(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/login']);
  }

  openTerms(event: Event): void {
    event.preventDefault();
    // Aquí puedes implementar la lógica para mostrar términos y condiciones
    console.log('Abrir términos y condiciones');
    // this.router.navigate(['/terminos']);
  }

  openPrivacy(event: Event): void {
    event.preventDefault();
    // Aquí puedes implementar la lógica para mostrar política de privacidad
    console.log('Abrir política de privacidad');
    // this.router.navigate(['/privacidad']);
  }

  // Métodos de validación
  validateName(): boolean {
    return this.nombre.trim().length >= 2;
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  validatePassword(): boolean {
    // Mínimo 8 caracteres, al menos 1 mayúscula y 1 número
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(this.contrasena);
  }

  validatePasswordMatch(): boolean {
    return this.contrasena === this.confirmarContrasena && this.contrasena.length > 0;
  }

  isFormValid(): boolean {
    return this.validateName() && 
           this.validateEmail() && 
           this.validatePassword() && 
           this.validatePasswordMatch() && 
           this.aceptoTerminos && 
           !this.isLoading;
  }

  // Método para crear partículas en los enlaces (similar al login)
  createLinkParticles(event: MouseEvent): void {
    const link = event.currentTarget as HTMLAnchorElement;
    const particles = link.querySelector('.link-particles');
    
    if (particles) {
      const particlesArray = Array.from(particles.children) as HTMLElement[];
      particlesArray.forEach(particle => {
        particle.style.animation = 'none';
        setTimeout(() => {
          particle.style.animation = '';
        }, 10);
      });
    }
  }
}
import { Component, ElementRef, AfterViewInit, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { RegisterDto, AuthResponse } from '../../modelos/auth.models';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class Registro implements OnInit, AfterViewInit, OnDestroy {
  // Inyectar servicios
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private route = inject(ActivatedRoute);

  // Campos del formulario
  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmarPassword: string = '';
  rol: 'paciente' | 'medico' = 'paciente';
  
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
  private redirectTimer: any;

  @ViewChild('registerForm') registerForm: any;

  constructor() {
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
    // Verificar si hay un parámetro de rol en la URL
    this.checkUrlParameters();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }

  private checkUrlParameters(): void {
    this.route.queryParams.subscribe(params => {
      if (params['rol']) {
        const requestedRole = params['rol'].toLowerCase();
        if (requestedRole === 'medico' || requestedRole === 'paciente') {
          this.rol = requestedRole;
        }
      }
    });
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
      
      const x = (event.clientX - rect.left) + (Math.random() - 0.5) * 40;
      const y = (event.clientY - rect.top) + (Math.random() - 0.5) * 40;
      
      particle.style.setProperty('--x', `${(Math.random() - 0.5) * 60}px`);
      particle.style.setProperty('--y', `${-Math.random() * 40 - 20}px`);
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      button.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1500);
    }
  }

  // Selección de rol
  selectRole(role: 'paciente' | 'medico'): void {
    if (this.isLoading) return;
    
    this.rol = role;
    this.onInputChange();
    
    // Actualizar la URL sin recargar la página
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { rol: role },
      queryParamsHandling: 'merge'
    });
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
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      password: this.password,
      rol: this.rol
    };

    console.log('Enviando registro:', registerDto);

    // Llamar al servicio de autenticación
    this.authService.register(registerDto).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.handleRegistrationSuccess(response);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.handleRegistrationError(error);
      }
    });
  }

  private handleRegistrationSuccess(response: any): void {
    const roleMessage = this.rol === 'medico' ? 
      '¡Cuenta de médico creada exitosamente! Redirigiendo para completar tu perfil...' : 
      '¡Cuenta de paciente creada exitosamente! Redirigiendo al inicio...';
    
    this.showSuccessAlert(roleMessage);
    
    // Guardar información del usuario en localStorage
    this.saveUserData(response);
    
    // Redirección con timer
    this.redirectTimer = setTimeout(() => {
      this.redirectAfterRegistration();
    }, 2500);
  }

  private saveUserData(response: any): void {
    // Guardar token si está disponible
    if (response.token) {
      localStorage.setItem('auth_token', response.token);
    }
    
    // Guardar información básica del usuario
    const userData = {
      id: response.id,
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
      registradoEn: new Date().toISOString()
    };
    
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('user_role', this.rol);
  }

  private redirectAfterRegistration(): void {
    if (this.rol === 'medico') {
      // Redirigir a completar perfil médico
      this.router.navigate(['/medico'], {
        state: {
          userData: {
            nombre: this.nombre,
            email: this.email,
            rol: this.rol
          }
        }
      });
    } else {
      // Redirigir al dashboard de paciente
      this.router.navigate(['/inicio'], {
        state: {
          userData: {
            nombre: this.nombre,
            email: this.email,
            rol: this.rol
          }
        }
      });
    }
  }

  private handleRegistrationError(error: any): void {
    console.error('Error en registro:', error);
    
    let errorMessage = 'Error al crear la cuenta. Inténtalo de nuevo.';
    
    if (error?.error?.includes('409') || error?.error?.includes('Email ya registrado')) {
      errorMessage = 'El email ya está registrado. Por favor usa otro email.';
    } else if (error?.error?.includes('400') || error?.error?.includes('Datos inválidos')) {
      errorMessage = 'Datos inválidos. Por favor verifica la información.';
    } else if (error?.error) {
      errorMessage = typeof error.error === 'string' ? error.error : 'Error del servidor';
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (error?.status === 0) {
      errorMessage = 'Error de conexión. Verifica tu internet.';
    }
    
    this.showErrorAlert(errorMessage);
  }

  // Método para redirección manual (si el usuario no quiere esperar)
  redirectNow(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
    this.redirectAfterRegistration();
  }

  private showErrorAlert(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    
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
    // Redirigir a página de términos o abrir modal
    this.router.navigate(['/terminos-condiciones']);
  }

  openPrivacy(event: Event): void {
    event.preventDefault();
    // Redirigir a página de privacidad o abrir modal
    this.router.navigate(['/privacidad']);
  }

  // Métodos de validación
  validateNombre(): boolean {
    return this.nombre.trim().length >= 2;
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  validatePassword(): boolean {
    return this.password.length >= 6;
  }

  validatePasswordMatch(): boolean {
    return this.password === this.confirmarPassword && this.password.length > 0;
  }

  // Métodos para fortaleza de contraseña
  getPasswordStrength(): string {
    if (!this.password) return 'empty';
    
    const strength = this.calculatePasswordStrength();
    if (strength < 40) return 'weak';
    if (strength < 70) return 'medium';
    return 'strong';
  }

  getPasswordStrengthPercentage(): number {
    return this.calculatePasswordStrength();
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    switch (strength) {
      case 'weak': return 'Débil';
      case 'medium': return 'Media';
      case 'strong': return 'Fuerte';
      default: return '';
    }
  }

  private calculatePasswordStrength(): number {
    let strength = 0;
    
    // Longitud
    if (this.password.length >= 8) strength += 25;
    else if (this.password.length >= 6) strength += 15;
    
    // Mayúsculas y minúsculas
    if (/[a-z]/.test(this.password) && /[A-Z]/.test(this.password)) strength += 25;
    
    // Números
    if (/\d/.test(this.password)) strength += 25;
    
    // Caracteres especiales
    if (/[^A-Za-z0-9]/.test(this.password)) strength += 25;
    
    return Math.min(strength, 100);
  }

  isFormValid(): boolean {
    return this.validateNombre() && 
           this.validateEmail() && 
           this.validatePassword() && 
           this.validatePasswordMatch() && 
           this.aceptoTerminos && 
           !this.isLoading;
  }

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
import { Component, ElementRef, AfterViewInit, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { PacienteService } from '../../servicios/paciente.service';
import { RegisterDto, AuthResponse } from '../../modelos/auth.models';
import { PacienteDto } from '../../modelos/paciente.models';

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
  private pacienteService = inject(PacienteService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private route = inject(ActivatedRoute);

  // Campos del formulario base
  nombre: string = '';
  email: string = '';
  password: string = '';
  confirmarPassword: string = '';
  rol: 'paciente' | 'medico' = 'paciente';
  
  // Campos específicos para paciente
  documento: string = '';
  telefono: string = '';
  direccion: string = '';
  fechaNacimiento: string = '';
  grupoSanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '' = '';
  
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
    this.checkUrlParameters();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initSmoothSwap();
    }, 500);
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }

  // Métodos de inicialización
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
        this.handleRegistrationSuccess(response);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.handleRegistrationError(error);
      }
    });
  }

  private handleRegistrationSuccess(response: any): void {
    console.log('✅ Respuesta del registro:', response);
    
    // OBTENER EL USER ID CORRECTAMENTE - CORRECCIÓN PRINCIPAL
    const userId = this.extractUserId(response);
    
    if (!userId) {
      this.isLoading = false;
      this.showErrorAlert('Error: No se pudo obtener el ID del usuario creado');
      return;
    }

    if (this.rol === 'paciente') {
      // Si es paciente, crear el perfil de paciente después del registro
      this.crearPerfilPaciente(userId, response);
    } else {
      // Si es médico, redirigir para completar perfil
      this.handleMedicoRegistration(userId, response);
    }
  }

  // NUEVO MÉTODO PARA EXTRAER EL USER ID
  private extractUserId(response: any): string | null {
    console.log('🔍 Extrayendo user ID de:', response);
    
    // Diferentes formas en que podría venir el ID
    if (response?.user?._id) return response.user._id;
    if (response?.user?.id) return response.user.id;
    if (response?._id) return response._id;
    if (response?.id) return response.id;
    if (response?.data?._id) return response.data._id;
    if (response?.data?.id) return response.data.id;
    if (response?.userId) return response.userId;
    
    return null;
  }

  private crearPerfilPaciente(userId: string, authResponse: any): void {
    const pacienteDto: PacienteDto = {
      user: userId, // USAR EL USER ID EXTRAÍDO CORRECTAMENTE
      documento: this.documento.trim(),
      telefono: this.telefono.trim(),
      direccion: this.direccion.trim(),
      fechaNacimiento: this.fechaNacimiento,
      grupoSanguineo: this.grupoSanguineo || undefined
    };

    console.log('📝 Creando perfil de paciente:', pacienteDto);

    this.pacienteService.crearPaciente(pacienteDto).subscribe({
      next: (pacienteResponse: any) => {
        this.isLoading = false;
        this.handlePacienteRegistrationSuccess(userId, authResponse, pacienteResponse);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.handlePacienteProfileError(error, userId, authResponse);
      }
    });
  }

  private handlePacienteRegistrationSuccess(userId: string, authResponse: any, pacienteResponse: any): void {
    const successMessage = '¡Cuenta de paciente creada exitosamente! Redirigiendo al inicio...';
    this.showSuccessAlert(successMessage);
    
    // Guardar información del usuario en localStorage
    this.saveUserData(userId, authResponse, pacienteResponse);
    
    // Redirección con timer
    this.redirectTimer = setTimeout(() => {
      this.redirectAfterRegistration();
    }, 2500);
  }

  private handlePacienteProfileError(error: any, userId: string, authResponse: any): void {
    console.error('❌ Error creando perfil de paciente:', error);
    
    // Aunque falló la creación del perfil, el usuario fue creado
    const warningMessage = 'Cuenta creada, pero hubo un error al completar el perfil. Podrás completarlo más tarde.';
    this.showSuccessAlert(warningMessage);
    
    this.saveUserData(userId, authResponse);
    
    this.redirectTimer = setTimeout(() => {
      this.redirectAfterRegistration();
    }, 3000);
  }

  private handleMedicoRegistration(userId: string, response: any): void {
    this.isLoading = false;
    const roleMessage = '¡Cuenta de médico creada exitosamente! Redirigiendo para completar tu perfil...';
    this.showSuccessAlert(roleMessage);
    
    this.saveUserData(userId, response);
    
    this.redirectTimer = setTimeout(() => {
      this.redirectAfterRegistration();
    }, 2500);
  }

  // ACTUALIZADO: Ahora recibe userId explícitamente
  private saveUserData(userId: string, authResponse: any, pacienteResponse?: any): void {
    // Guardar token si está disponible
    if (authResponse.token) {
      localStorage.setItem('auth_token', authResponse.token);
    }
    
    // Guardar información básica del usuario
    const userData = {
      id: userId, // USAR EL USER ID QUE SABEMOS QUE ES CORRECTO
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
      registradoEn: new Date().toISOString(),
      // Si es paciente y se creó el perfil, guardar información adicional
      ...(this.rol === 'paciente' && pacienteResponse && {
        pacienteId: pacienteResponse._id || pacienteResponse.id,
        perfilCompletado: true
      })
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
    console.error('❌ Error en registro:', error);
    
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

  // Métodos de alertas y mensajes
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

  // Métodos de eventos
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

  // Métodos de validación (se mantienen igual)
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

  validateDocumento(): boolean {
    return this.documento.trim().length >= 6;
  }

  validateTelefono(): boolean {
    return this.telefono.trim().length >= 8;
  }

  validateDireccion(): boolean {
    return this.direccion.trim().length >= 10;
  }

  validateFechaNacimiento(): boolean {
    if (!this.fechaNacimiento) return false;
    
    const fechaNac = new Date(this.fechaNacimiento);
    const hoy = new Date();
    const edad = hoy.getFullYear() - fechaNac.getFullYear();
    
    return edad >= 0 && edad <= 120;
  }

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
    
    if (this.password.length >= 8) strength += 25;
    else if (this.password.length >= 6) strength += 15;
    
    if (/[a-z]/.test(this.password) && /[A-Z]/.test(this.password)) strength += 25;
    
    if (/\d/.test(this.password)) strength += 25;
    
    if (/[^A-Za-z0-9]/.test(this.password)) strength += 25;
    
    return Math.min(strength, 100);
  }

  calcularEdad(): number {
    if (!this.fechaNacimiento) return 0;
    
    const fechaNac = new Date(this.fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    
    const mes = hoy.getMonth();
    const dia = hoy.getDate();
    
    if (mes < fechaNac.getMonth() || 
        (mes === fechaNac.getMonth() && dia < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  }

  getMaxDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  isFormValid(): boolean {
    const baseValid = this.validateNombre() && 
                     this.validateEmail() && 
                     this.validatePassword() && 
                     this.validatePasswordMatch() && 
                     this.aceptoTerminos && 
                     !this.isLoading;

    if (this.rol === 'paciente') {
      return baseValid && 
             this.validateDocumento() && 
             this.validateTelefono() && 
             this.validateDireccion() && 
             this.validateFechaNacimiento();
    }

    return baseValid;
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
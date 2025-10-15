import { Component, ElementRef, AfterViewInit, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';
import { LoginDto } from '../../modelos/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);
  private route = inject(ActivatedRoute);

  email: string = '';
  password: string = '';
  
  isLoading: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  successMessage: string = '';
  showSuccess: boolean = false;
  
  private hasSwapped: boolean = false;
  private returnUrl: string = '';
  private routerSubscription: Subscription;

  constructor() {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.url.includes('/login')) {
          this.clearError();
        }
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      
      if (params['sessionExpired']) {
        this.showErrorAlert('Su sesión ha expirado. Por favor ingrese nuevamente.');
      }
      
      if (params['unauthorized']) {
        this.showErrorAlert('No tiene permisos para acceder a esa página.');
      }

      if (params['registered']) {
        this.showSuccessAlert('¡Registro exitoso! Por favor inicia sesión.');
      }
    });

    this.clearError();
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
    const loginContainer = this.elementRef.nativeElement.querySelector('.login-container');
    
    if (loginContainer && !this.hasSwapped) {
      loginContainer.classList.add('swap-init');
      
      setTimeout(() => {
        loginContainer.classList.remove('swap-init');
        loginContainer.classList.add('swap-completed');
        this.hasSwapped = true;
      }, 800);
    }
  }

  onLogin(): void {
    if (!this.isFormValid()) {
      this.showErrorAlert('Por favor ingresa email y contraseña válidos');
      return;
    }

    this.isLoading = true;
    this.clearError();

    const loginDto: LoginDto = {
      email: this.email.trim(),
      password: this.password
    };

    console.log('Enviando login:', loginDto);

    this.authService.login(loginDto).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.handleLoginSuccess(response);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.handleLoginError(error);
      }
    });
  }

  private handleLoginSuccess(response: any): void {
    const user = this.authService.getCurrentUser();
    this.showSuccessAlert(`¡Bienvenido a Salud Vital ${user?.nombre}! Redirigiendo...`);
    
    setTimeout(() => {
      this.redirectByRole(user);
    }, 1000);
  }

  private redirectByRole(user: any): void {
    // Si hay una returnUrl específica y el usuario tiene permisos, usarla
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    // Redirección basada en el rol
    switch (user?.rol) {
      case 'medico':
        this.router.navigate(['/medico']); // Cambiar por la ruta deseada para médicos
        break;
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'paciente':
      default:
        this.router.navigate(['/inicio']);
        break;
    }
  }

  private handleLoginError(error: any): void {
    console.error('Error en login:', error);
    
    if (error?.message?.includes('401') || error?.message?.includes('Credenciales inválidas')) {
      this.showErrorAlert('Email o contraseña incorrectos');
    } else if (error?.message?.includes('400') || error?.message?.includes('Datos inválidos')) {
      this.showErrorAlert('Datos inválidos. Por favor verifica la información.');
    } else if (error?.message) {
      this.showErrorAlert(error.message);
    } else {
      this.showErrorAlert('Error al iniciar sesión. Inténtalo de nuevo.');
    }
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
    
    setTimeout(() => {
      this.clearSuccess();
    }, 3000);
  }

  private clearError(): void {
    this.errorMessage = '';
    this.showError = false;
  }

  private clearSuccess(): void {
    this.successMessage = '';
    this.showSuccess = false;
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }

  onInputChange(): void {
    if (this.showError) {
      this.clearError();
    }
    if (this.showSuccess) {
      this.clearSuccess();
    }
  }

  goToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/registro']);
  }

  validateEmail(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }

  validatePassword(): boolean {
    return this.password.length >= 1;
  }

  isFormValid(): boolean {
    return this.validateEmail() && this.validatePassword() && !this.isLoading;
  }

  // Método para login rápido (solo desarrollo)
  quickLogin(role: string): void {
    const users = {
      'paciente': { email: 'paciente@correo.com', password: 'Password123' },
      'medico': { email: 'medico@correo.com', password: 'Password123' },
      'admin': { email: 'admin@correo.com', password: 'Password123' }
    };

    const selectedUser = users[role as keyof typeof users];
    if (selectedUser) {
      this.email = selectedUser.email;
      this.password = selectedUser.password;
      setTimeout(() => this.onLogin(), 100);
    }
  }

  openUserManual(): void {
    this.router.navigate(['/manual-usuario']);
  }
}
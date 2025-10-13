import { Component, ElementRef, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Subscription } from 'rxjs';
import { AuthService } from '../../servicios/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit, AfterViewInit, OnDestroy {
  nombreUsuario: string = '';
  contrasena: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  showError: boolean = false;
  
  private hasSwapped: boolean = false;
  private returnUrl: string = '';
  private routerSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef,
    private route: ActivatedRoute
  ) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (event.url.includes('/login')) {
          this.clearError();
        }
      }
    });
  }

  ngOnInit() {
    this.authService.logout();
    
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '';
      
      if (params['sessionExpired']) {
        this.showErrorAlert('Su sesión ha expirado. Por favor ingrese nuevamente.');
      }
      
      if (params['unauthorized']) {
        this.showErrorAlert('No tiene permisos para acceder a esa página.');
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
    // Espera inicial antes de comenzar la transición
    setTimeout(() => {
      this.initSmoothSwap();
    }, 500);
  }

  private initSmoothSwap(): void {
    const loginContainer = this.elementRef.nativeElement.querySelector('.login-container');
    
    if (loginContainer && !this.hasSwapped) {
      // Inicia el estado de transición
      loginContainer.classList.add('swap-init');
      
      // Espera 1200ms (igual a la duración de la transición CSS) antes de completar
      setTimeout(() => {
        loginContainer.classList.remove('swap-init');
        loginContainer.classList.add('swap-completed');
        this.hasSwapped = true;
        
        // Activa efectos secundarios después de completar la transición
        
      }, 800); // Esta duración coincide con la transición CSS
    }
  }

  onLogin(): void {
    // Redirigir directamente al inicio sin validaciones
    this.isLoading = true;
    
    // Simular un pequeño delay para la transición
    setTimeout(() => {
      this.isLoading = false;
      this.router.navigate(['/inicio']);
    }, 1000);
    
    /*
    // Código comentado - validaciones originales
    if (!this.nombreUsuario.trim() || !this.contrasena.trim()) {
      this.showErrorAlert('Por favor ingresa usuario y contraseña');
      return;
    }

    if (this.nombreUsuario.trim().length < 3) {
      this.showErrorAlert('El usuario debe tener al menos 3 caracteres');
      return;
    }

    if (this.contrasena.length < 4) {
      this.showErrorAlert('La contraseña debe tener al menos 4 caracteres');
      return;
    }

    this.isLoading = true;
    this.clearError();

    const usuarioLimpio = this.nombreUsuario.trim();
    const contrasenaLimpia = this.contrasena.trim();

    // Simulación de login (reemplazar con tu servicio real)
    setTimeout(() => {
      this.isLoading = false;
      if (usuarioLimpio === 'paciente' && contrasenaLimpia === '1234') {
        this.handleLoginSuccess();
      } else {
        this.showErrorAlert('Usuario o contraseña incorrectos');
      }
    }, 1500);
    */
  }

  private handleLoginSuccess(): void {
    this.showSuccessAlert('¡Bienvenido a Salud Vital! Redirigiendo...');
    
    setTimeout(() => {
      if (this.returnUrl) {
        this.router.navigateByUrl(this.returnUrl);
      } else {
        this.router.navigate(['/inicio']);
      }
    }, 1000);
  }

  private showErrorAlert(message: string): void {
    this.errorMessage = message;
    this.showError = true;
    
    setTimeout(() => {
      this.clearError();
    }, 5000);
  }

  private showSuccessAlert(message: string): void {
    console.log('Login exitoso:', message);
  }

  private clearError(): void {
    this.errorMessage = '';
    this.showError = false;
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
  }

  goToRegister(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/registro']);
  }

  validateUsername(): boolean {
    return this.nombreUsuario.trim().length >= 3;
  }

  validatePassword(): boolean {
    return this.contrasena.length >= 4;
  }

  isFormValid(): boolean {
    // Permitir siempre el envío del formulario sin validaciones
    return true;
    
    // Código original comentado:
    // return this.validateUsername() && this.validatePassword() && !this.isLoading;
  }

  quickLogin(role: string): void {
    const users = {
      'paciente': { user: 'paciente', pass: '1234' },
      'doctor': { user: 'doctor', pass: '1234' },
      'admin': { user: 'admin', pass: '1234' }
    };

    const selectedUser = users[role as keyof typeof users];
    if (selectedUser) {
      this.nombreUsuario = selectedUser.user;
      this.contrasena = selectedUser.pass;
      setTimeout(() => this.onLogin(), 100);
    }
  }

  openUserManual(): void {
    this.router.navigate(['/manual-usuario']);
  }
}
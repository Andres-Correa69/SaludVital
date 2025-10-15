import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const currentUser = authService.getCurrentUser();
    
    // Verificar si ya está en la ruta correcta según su rol
    if (currentUser) {
      const currentUrl = state.url;
      
      // Si es médico y está intentando acceder a rutas de paciente, redirigir
      if (currentUser.rol === 'medico' && currentUrl.startsWith('/paciente')) {
        router.navigate(['/medico/dashboard']);
        return false;
      }
      
      // Si es paciente y está intentando acceder a rutas de médico, redirigir
      if (currentUser.rol === 'paciente' && currentUrl.startsWith('/medico')) {
        router.navigate(['/inicio']);
        return false;
      }
    }
    
    return true;
  } else {
    // Guardar la URL a la que intentaba acceder para redirigir después del login
    const returnUrl = state.url;
    router.navigate(['/login'], { 
      queryParams: { returnUrl: returnUrl } 
    });
    return false;
  }
};

// Guard específico para médicos
export const medicoGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const currentUser = authService.getCurrentUser();
    
    if (currentUser?.rol === 'medico' || currentUser?.rol === 'admin') {
      return true;
    } else {
      // Redirigir a página de no autorizado o al inicio
      router.navigate(['/no-autorizado']);
      return false;
    }
  } else {
    const returnUrl = state.url;
    router.navigate(['/login'], { 
      queryParams: { returnUrl: returnUrl, unauthorized: true } 
    });
    return false;
  }
};

// Guard específico para pacientes
export const pacienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const currentUser = authService.getCurrentUser();
    
    if (currentUser?.rol === 'paciente' || currentUser?.rol === 'admin') {
      return true;
    } else {
      router.navigate(['/no-autorizado']);
      return false;
    }
  } else {
    const returnUrl = state.url;
    router.navigate(['/login'], { 
      queryParams: { returnUrl: returnUrl, unauthorized: true } 
    });
    return false;
  }
};
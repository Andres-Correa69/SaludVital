import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Si el token existe, el usuario puede acceder a la ruta
    return true;
  } else {
    // Si no hay token, se redirige al usuario a la página de login
    console.log('AuthGuard: Acceso denegado, redirigiendo a /login');
    return router.createUrlTree(['/login']);
  }
};

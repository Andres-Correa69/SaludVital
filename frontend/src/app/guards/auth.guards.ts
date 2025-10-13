import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // Usuario autenticado - acceso permitido
      return true;
    }

    // Usuario no autenticado - redirigir al login
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: route.url.join('/') } 
    });
    return false;
  }
}
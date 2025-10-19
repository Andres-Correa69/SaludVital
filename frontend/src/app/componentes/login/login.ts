import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { LoginDTO } from '../../modelos/login.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials: LoginDTO = { email: '', password: '' };
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onLogin(): void {
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor, ingrese su email y contraseña.';
      return;
    }

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login exitoso!', response);
        // Redirigir al usuario a la página de perfil o a un dashboard
        this.router.navigate(['/perfil']);
      },
      error: (err) => {
        console.error('Error en el login', err);
        this.errorMessage = 'Credenciales incorrectas. Por favor, intente de nuevo.';
      }
    });
  }
}

import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';
import { RegistroDTO } from '../../modelos/registro.dto';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  registroData: RegistroDTO = { nombre: '', email: '', password: '' };
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onRegister(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.registroData).subscribe({
      next: (response) => {
        console.log('Registro exitoso!', response);
        this.successMessage = '¡Registro exitoso! Serás redirigido al login en unos segundos.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (err) => {
        console.error('Error en el registro', err);
        this.errorMessage = 'Error en el registro. Es posible que el correo ya esté en uso.';
      }
    });
  }
}

import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Importar FormsModule
import { HttpClientModule } from '@angular/common/http'; // Importar HttpClientModule

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    FormsModule, // Añadir FormsModule
    HttpClientModule // Añadir HttpClientModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('VitalSalud - Gestión de Citas Médicas');
}

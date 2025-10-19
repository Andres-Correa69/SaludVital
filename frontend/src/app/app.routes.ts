import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login';
import { InicioComponent } from './componentes/inicio/inicio';
import { AgendarCitaComponent } from './componentes/agendar-cita/agendar-cita';
import { ListaCitasComponent } from './componentes/lista-citas/lista-citas';
import { ResultadosMedicosComponent } from './componentes/resultados-medicos/resultados-medicos';
import { AlertasSaludComponent } from './componentes/alertas-salud/alertas-salud';
import { PerfilComponent } from './componentes/perfil/perfil';
import { RegistroComponent } from './componentes/registro/registro';
import { authGuard } from './guards/auth.guards'; // Importar el nuevo guard

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'inicio',
    component: InicioComponent,
    canActivate: [authGuard] // Proteger ruta
  },
  {
    path: 'agendar-cita',
    component: AgendarCitaComponent,
    canActivate: [authGuard] // Proteger ruta
  },
  {
    path: 'lista-citas',
    component: ListaCitasComponent,
    canActivate: [authGuard] // Proteger ruta
  },
  {
    path: 'resultados-medicos',
    component: ResultadosMedicosComponent,
    canActivate: [authGuard] // Proteger ruta
  },
  {
    path: 'alertas-salud',
    component: AlertasSaludComponent,
    canActivate: [authGuard] // Proteger ruta
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard] // Proteger ruta
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/inicio' } // Redirigir a una ruta protegida
];
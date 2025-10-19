import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login';
import { InicioComponent } from './componentes/inicio/inicio';
import { AgendarCitaComponent } from './componentes/agendar-cita/agendar-cita';
import { ListaCitasComponent } from './componentes/lista-citas/lista-citas';
import { ResultadosMedicosComponent } from './componentes/resultados-medicos/resultados-medicos';
import { AlertasSaludComponent } from './componentes/alertas-salud/alertas-salud';
import { PerfilComponent } from './componentes/perfil/perfil';
import { RegistroComponent } from './componentes/registro/registro';
import { authGuard } from './guards/auth.guards';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
  {
    path: 'inicio',
    component: InicioComponent,
    canActivate: [authGuard]
  },
  {
    path: 'agendar-cita',
    component: AgendarCitaComponent,
    canActivate: [authGuard]
  },
  {
    path: 'lista-citas',
    component: ListaCitasComponent,
    canActivate: [authGuard]
  },
  {
    path: 'resultados-medicos',
    component: ResultadosMedicosComponent,
    canActivate: [authGuard]
  },
  {
    path: 'alertas-salud',
    component: AlertasSaludComponent,
    canActivate: [authGuard]
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/inicio' }
];

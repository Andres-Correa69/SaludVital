import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { InicioComponent } from './componentes/inicio/inicio.component';
import { AgendarCitaComponent } from './componentes/agendar-cita/agendar-cita.component';
import { ListaCitasComponent } from './componentes/lista-citas/lista-citas.component';
import { ResultadosMedicosComponent } from './componentes/resultados-medicos/resultados-medicos.component';
import { AlertasSaludComponent } from './componentes/alertas-salud/alertas-salud.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { RegistroComponent } from './componentes/registro/registro.component';
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
import { Routes } from '@angular/router';
import { Login } from './componentes/login/login';
import { Inicio } from './componentes/inicio/inicio';
import { AgendarCita } from './componentes/agendar-cita/agendar-cita';
import { ListaCitas } from './componentes/lista-citas/lista-citas';
import { ResultadosMedicos } from './componentes/resultados-medicos/resultados-medicos';
import { AlertasSalud } from './componentes/alertas-salud/alertas-salud';
import { Perfil } from './componentes/perfil/perfil';
import { Registro } from './componentes/registro/registro';
import { AuthGuard } from './guards/auth.guards';



export const routes: Routes = [
  { path: 'login', component: Login },
  { 
    path: 'inicio', 
    component: Inicio
  },
  { 
    path: 'agendar-cita', 
    component: AgendarCita
  },
  { 
    path: 'lista-citas', 
    component: ListaCitas
  },
  { 
    path: 'resultados-medicos', 
    component: ResultadosMedicos
  },
  { 
    path: 'alertas-salud', 
    component: AlertasSalud 
  },
  { 
    path: 'perfil', 
    component: Perfil
  },
  { path: 'registro', component: Registro },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/inicio' }
];
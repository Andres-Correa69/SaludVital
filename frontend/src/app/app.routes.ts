import { Routes } from '@angular/router';
import { Login } from './componentes/login/login';
import { Inicio } from './componentes/inicio/inicio';
import { AgendarCita } from './componentes/agendar-cita/agendar-cita';
import { ListaCitas } from './componentes/lista-citas/lista-citas';
import { ResultadosMedicos } from './componentes/resultados-medicos/resultados-medicos';
import { AlertasSalud } from './componentes/alertas-salud/alertas-salud';
import { Perfil } from './componentes/perfil/perfil';
import { Registro } from './componentes/registro/registro';
import { authGuard } from './guards/auth.guards';
import { MedicoDashboard } from './componentes/medico/medico-dashboard/medico-dashboard';


export const routes: Routes = [
  { 
    path: 'login', 
    component: Login 
  },
  { 
    path: 'registro', 
    component: Registro 
  },
  { 
    path: 'inicio', 
    component: Inicio,
    canActivate: [authGuard]
  },
  { 
    path: 'agendar-cita', 
    component: AgendarCita,
    canActivate: [authGuard]
  },
  { 
    path: 'lista-citas', 
    component: ListaCitas,
    canActivate: [authGuard]
  },
  { 
    path: 'resultados-medicos', 
    component: ResultadosMedicos,
    canActivate: [authGuard]
  },
  { 
    path: 'alertas-salud', 
    component: AlertasSalud,
    canActivate: [authGuard]
  },
  { 
    path: 'perfil', 
    component: Perfil,
    canActivate: [authGuard]
  },
  { 
    path: 'medico', 
    component: MedicoDashboard,
    canActivate: [authGuard]
  },
  { 
    path: '', 
    redirectTo: '/inicio', 
    pathMatch: 'full'
  },
  { 
    path: '**', 
    redirectTo: '/inicio'
  }
];
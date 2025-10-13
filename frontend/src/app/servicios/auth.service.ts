import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Usuarios de prueba actualizados
  private testUsers: User[] = [
    {
      id: '1',
      email: 'maria.gonzalez@email.com',
      nombre: 'María Gonzalez'
    },
    {
      id: '2',
      email: 'carlos.rodriguez@saludvital.com',
      nombre: 'Carlos Rodríguez'
    },
    {
      id: '3', 
      email: 'ana.martinez@saludvital.com',
      nombre: 'Ana Martínez'
    }
  ];

  constructor(private router: Router) {
    // Verificar si hay usuario en localStorage al iniciar
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }
  }

  login(loginDto: LoginDto): Observable<AuthResponse | null> {
    return new Observable<AuthResponse | null>(observer => {
      setTimeout(() => {
        // Validación simple para prueba
        const user = this.testUsers.find(u => 
          u.email === loginDto.email && 
          loginDto.password === '1234' // Contraseña simple para testing
        );

        if (user) {
          // Login exitoso
          const authResponse: AuthResponse = {
            user: user,
            token: 'fake-jwt-token-' + user.id // Token simulado
          };
          
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          
          // Guardar en localStorage para persistencia
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('authToken', authResponse.token);
          localStorage.setItem('isAuthenticated', 'true');
          
          observer.next(authResponse);
        } else {
          // Login fallido
          observer.next(null);
        }
        observer.complete();
      }, 1000); // Simular delay de red
    });
  }

  register(registerDto: RegisterDto): Observable<AuthResponse | null> {
    return new Observable<AuthResponse | null>(observer => {
      setTimeout(() => {
        // Verificar si el email ya existe
        const existingUser = this.testUsers.find(u => u.email === registerDto.email);
        
        if (existingUser) {
          observer.next(null); // Email ya registrado
        } else {
          // Simular registro exitoso
          const newUser: User = {
            id: (this.testUsers.length + 1).toString(),
            email: registerDto.email,
            nombre: registerDto.nombre
          };
          
          this.testUsers.push(newUser);
          
          const authResponse: AuthResponse = {
            user: newUser,
            token: 'fake-jwt-token-' + newUser.id
          };
          
          // Auto-login después del registro
          this.currentUserSubject.next(newUser);
          this.isAuthenticatedSubject.next(true);
          
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          localStorage.setItem('authToken', authResponse.token);
          localStorage.setItem('isAuthenticated', 'true');
          
          observer.next(authResponse);
        }
        observer.complete();
      }, 2000);
    });
  }

  logout(): void {
    // Limpiar datos de sesión
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    
    // Remover de localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    
    // Redirigir al login
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  // Método para simular expiración de token (útil para testing)
  simulateTokenExpiration(): void {
    setTimeout(() => {
      if (this.isLoggedIn()) {
        console.log('Token expirado - simulando logout automático');
        this.logout();
        this.router.navigate(['/login'], { 
          queryParams: { sessionExpired: true } 
        });
      }
    }, 300000); // 5 minutos para testing
  }

  // Método para recuperar contraseña (simulado)
  recoverPassword(email: string): Observable<boolean> {
    return new Observable<boolean>(observer => {
      setTimeout(() => {
        const userExists = this.testUsers.some(u => u.email === email);
        observer.next(userExists);
        observer.complete();
      }, 1500);
    });
  }

  // Método para verificar si el usuario está autenticado (para guards)
  checkAuthentication(): Observable<boolean> {
    return of(this.isLoggedIn()).pipe(delay(100));
  }
}
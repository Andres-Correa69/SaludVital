import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginDto, RegisterDto, AuthResponse, User } from '../modelos/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private apiService = inject(ApiService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.clearAuthData();
      }
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private setAuthData(user: User, token: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  login(loginDto: LoginDto): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', loginDto)
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            this.setAuthData(response.user, response.token);
          }
        }),
        catchError(error => {
          this.clearAuthData();
          throw error;
        })
      );
  }

  register(registerDto: RegisterDto): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/registro', registerDto)
      .pipe(
        tap(response => {
          if (response.token && response.user) {
            this.setAuthData(response.user, response.token);
          }
        }),
        catchError(error => {
          this.clearAuthData();
          throw error;
        })
      );
  }

  logout(): void {
    this.clearAuthData();
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

  checkAuthentication(): Observable<boolean> {
    const isAuthenticated = this.isLoggedIn();
    return of(isAuthenticated);
  }

  recoverPassword(email: string): Observable<any> {
    return of({ message: 'Funcionalidad no implementada' });
  }
}
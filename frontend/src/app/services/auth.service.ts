import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check for existing token on service initialization
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Validate token and get user info
      this.validateToken().subscribe();
    }
  }

  // Register new user
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  // Login user
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.success && response.data?.token) {
          localStorage.setItem('auth_token', response.data.token);
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  // Logout user
  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
  }

  // Validate token and get current user
  validateToken(): Observable<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return new Observable(observer => {
        observer.next({ success: false, message: 'No token found' });
        observer.complete();
      });
    }

    return this.http.get(`${this.baseUrl}/validate`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap((response: any) => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data);
        } else {
          this.logout();
        }
      })
    );
  }

  // Get current user value
  get currentUserValue(): any | null {
    return this.currentUserSubject.value;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token') && !!this.currentUserValue;
  }

  // Get auth token
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Refresh token
  refreshToken(): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh`, {}, {
      headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
    }).pipe(
      tap((response: any) => {
        if (response.success && response.data?.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
      })
    );
  }

  // Forgot password
  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  // Reset password
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, {
      token,
      newPassword
    });
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/change-password`, {
      currentPassword,
      newPassword
    }, {
      headers: { 'Authorization': `Bearer ${this.getAuthToken()}` }
    });
  }
}

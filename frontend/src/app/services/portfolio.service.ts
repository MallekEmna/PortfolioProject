import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Portfolio } from '../core/models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
    private baseUrl = 'http://localhost:5000/api/portfolios';
    private portfolios = signal<Portfolio[]>([]);
    private portfoliosSubject = new BehaviorSubject<Portfolio[]>([]);

    constructor(private http: HttpClient) {}

    // Get user portfolios
    getUserPortfolios(params?: { page?: number; limit?: number; status?: string }): Observable<any> {
        return this.http.get(`${this.baseUrl}`, { params });
    }

    // Get portfolio by ID
    getPortfolioById(id: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    // Create new portfolio
    createPortfolio(portfolio: Partial<Portfolio>): Observable<any> {
        return this.http.post(`${this.baseUrl}`, portfolio);
    }

    // Update portfolio
    updatePortfolio(id: string, portfolio: Partial<Portfolio>): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, portfolio);
    }

    // Publish portfolio
    publishPortfolio(id: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}/publish`, {});
    }

    // Delete portfolio
    deletePortfolio(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }

    // Get all published portfolios (public)
    getPublishedPortfolios(params?: { page?: number; limit?: number }): Observable<any> {
        return this.http.get(`${this.baseUrl}/public`, { params });
    }

    // Get public portfolio by URL
    getPublicPortfolio(publicUrl: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/public/${publicUrl}`);
    }

    // Legacy methods for backward compatibility
    getPortfoliosSignal() {
        return this.portfolios;
    }

    addPortfolio(portfolio: Portfolio) {
        this.portfolios.update(list => [...list, portfolio]);
        this.portfoliosSubject.next(this.portfolios());
    }

    deletePortfolioSignal(id: string) {
        this.portfolios.update(list => list.filter(p => p._id !== id));
        this.portfoliosSubject.next(this.portfolios());
    }

    updatePortfolioSignal(updated: Portfolio) {
        this.portfolios.update(list =>
            list.map(p => (p._id === updated._id ? updated : p))
        );
        this.portfoliosSubject.next(this.portfolios());
    }

    // Load portfolios from API
    loadPortfolios(params?: any): void {
        this.getUserPortfolios(params).subscribe({
            next: (response: any) => {
                if (response.success && response.data) {
                    this.portfolios.set(response.data);
                    this.portfoliosSubject.next(response.data);
                }
            },
            error: (error) => {
                console.error('Error loading portfolios:', error);
            }
        });
    }

    // Load published portfolios from API
    loadPublishedPortfolios(params?: any): void {
        this.getPublishedPortfolios(params).subscribe({
            next: (response: any) => {
                if (response.success && response.data) {
                    // For public portfolios, we might want a separate signal
                    console.log('Published portfolios loaded:', response.data);
                }
            },
            error: (error) => {
                console.error('Error loading published portfolios:', error);
            }
        });
    }

    // Get portfolios as observable
    getPortfoliosObservable(): Observable<Portfolio[]> {
        return this.portfoliosSubject.asObservable();
    }
}
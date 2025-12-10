import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { SocialLinks } from '../core/models/socialLinks.model';

@Injectable({ providedIn: 'root' })
export class SocialLinksService {
    private baseUrl = 'http://localhost:5000/api/social-links';
    private socialLinks = signal<SocialLinks | null>(null);
    private socialLinksSubject = new BehaviorSubject<SocialLinks | null>(null);

    constructor(private http: HttpClient) {}

    // Get user social links
    getSocialLinks(): Observable<any> {
        return this.http.get(`${this.baseUrl}`);
    }

    // Create or update social links (upsert)
    upsertSocialLinks(socialLinks: Partial<SocialLinks>): Observable<any> {
        return this.http.post(`${this.baseUrl}`, socialLinks);
    }

    // Update social links
    updateSocialLinks(socialLinks: Partial<SocialLinks>): Observable<any> {
        return this.http.put(`${this.baseUrl}`, socialLinks);
    }

    // Delete social links
    deleteSocialLinks(): Observable<any> {
        return this.http.delete(`${this.baseUrl}`);
    }

    // Legacy methods for backward compatibility
    getSocialLinksSignal() {
        return this.socialLinks;
    }

    updateSocialLinksSignal(updated: SocialLinks) {
        this.socialLinks.set(updated);
        this.socialLinksSubject.next(updated);
    }

    // Load social links from API
    loadSocialLinks(): void {
        this.getSocialLinks().subscribe({
            next: (response: any) => {
                if (response.success && response.data) {
                    this.socialLinks.set(response.data);
                    this.socialLinksSubject.next(response.data);
                }
            },
            error: (error) => {
                console.error('Error loading social links:', error);
            }
        });
    }

    // Get social links as observable
    getSocialLinksObservable(): Observable<SocialLinks | null> {
        return this.socialLinksSubject.asObservable();
    }
}

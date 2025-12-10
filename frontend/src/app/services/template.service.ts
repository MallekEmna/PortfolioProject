import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, of } from 'rxjs';
import { Template } from '../core/models/template.model';

@Injectable({ providedIn: 'root' })
export class TemplateService {
    private baseUrl = 'http://localhost:5000/api/templates';
    private templates = signal<Template[]>([]);
    private selectedTemplate = signal<Template | null>(null);
    private chosenTemplateId = signal<string | null>(null);
    private templatesSubject = new BehaviorSubject<Template[]>([]);

    constructor(private http: HttpClient) {}

    // Get all templates
    getTemplates(params?: { page?: number; limit?: number; category?: string }): Observable<any> {
        return this.http.get(`${this.baseUrl}`, { params });
    }

    // Get active templates only
    getActiveTemplates(): Observable<any> {
        return this.http.get(`${this.baseUrl}/active`);
    }

    // Get template by ID
    getTemplateById(id: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    // Create new template (Admin only)
    createTemplate(template: Partial<Template>): Observable<any> {
        return this.http.post(`${this.baseUrl}`, template);
    }

    // Update template (Admin only)
    updateTemplate(id: string, template: Partial<Template>): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, template);
    }

    // Delete template (Admin only)
    deleteTemplate(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`);
    }

    // Legacy methods for backward compatibility
    getTemplatesSignal() {
        return this.templates;
    }

    selectTemplate(id: string) {
        const t = this.templates().find(t => t._id === id) ?? null;
        this.selectedTemplate.set(t ? { ...t, colors: [...(t.colors ?? [])], layout: { ...t.layout, sections: [...(t.layout?.sections ?? [])] } } : null);
        return this.selectedTemplate;
    }

    getSelectedTemplate() {
        return this.selectedTemplate;
    }

    selectForUse(id: string | null) {
        this.chosenTemplateId.set(id);
    }

    getChosenTemplateId() {
        return this.chosenTemplateId;
    }

    updateTemplateSignal(updated: Template) {
        const list = this.templates();
        const idx = list.findIndex(t => t._id === updated._id);
        if (idx >= 0) {
            const newList = [...list];
            newList[idx] = { ...updated };
            this.templates.set(newList);
            this.selectedTemplate.set(null);
            this.templatesSubject.next(newList);
        }
    }

    // Load templates from API
    loadTemplates(params?: any): Observable<Template[]> {
        return this.getTemplates(params).pipe(
            map((response: any) => response?.data ?? response ?? []),
            tap((list: Template[]) => {
                this.templates.set(list);
                this.templatesSubject.next(list);
            }),
            catchError((error) => {
                console.error('Error loading templates:', error);
                return of([]);
            })
        );
    }

    // Load active templates from API
    loadActiveTemplates(): Observable<Template[]> {
        return this.getActiveTemplates().pipe(
            map((response: any) => response?.data ?? response ?? []),
            tap((list: Template[]) => {
                this.templates.set(list);
                this.templatesSubject.next(list);
            }),
            catchError((error) => {
                console.error('Error loading active templates:', error);
                return of([]);
            })
        );
    }

    // Get templates as observable
    getTemplatesObservable(): Observable<Template[]> {
        return this.templatesSubject.asObservable();
    }
}

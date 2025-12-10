import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Project } from '../core/models/project.model';
import { UserService } from './user.service'; // Ajouter cette importation

@Injectable({ providedIn: 'root' })
export class ProjectService {
    private baseUrl = 'http://localhost:5000/api/projects';
    private projects = signal<Project[]>([]);
    private projectsSubject = new BehaviorSubject<Project[]>([]);

    constructor(
        private http: HttpClient,
        private userService: UserService // Injecter UserService
    ) {}

    // Get all projects for current user
    getProjects(): Observable<any> {
        const userId = this.userService.getUserId();
        return this.http.get(`${this.baseUrl}?userId=${userId}`)
            .pipe(
                tap((response: any) => {
                    if (response && Array.isArray(response)) {
                        this.projects.set(response);
                        this.projectsSubject.next(response);
                    } else if (response.data) {
                        this.projects.set(response.data);
                        this.projectsSubject.next(response.data);
                    }
                })
            );
    }

    // Get project by ID
    getProjectById(id: string): Observable<any> {
        return this.http.get(`${this.baseUrl}/${id}`);
    }

    // Create new project
    createProject(project: Partial<Project>): Observable<any> {
        // S'assurer que le projet a l'ID utilisateur
        const projectWithUser = {
            ...project,
            userId: this.userService.getUserId()
        };
        
        return this.http.post(`${this.baseUrl}`, projectWithUser)
            .pipe(
                tap((response: any) => {
                    if (response) {
                        const newProject = response._id ? response : response.data;
                        if (newProject) {
                            this.projects.update(list => [...list, newProject]);
                            this.projectsSubject.next(this.projects());
                        }
                    }
                })
            );
    }

    // Create new project with image
    createProjectWithImage(project: Partial<Project>, imageFile?: File): Observable<any> {
        const formData = new FormData();
        
        // Ajouter les champs du projet
        Object.keys(project).forEach(key => {
            if (key === 'techStack' && Array.isArray(project[key])) {
                formData.append(key, (project[key] as string[]).join(', '));
            } else if (project[key as keyof Partial<Project>] !== undefined) {
                formData.append(key, project[key as keyof Partial<Project>] as string);
            }
        });
        
        // Ajouter l'ID utilisateur
        formData.append('userId', this.userService.getUserId());
        
        // Ajouter l'image si elle existe
        if (imageFile) {
            formData.append('projectImage', imageFile);
        }
        
        return this.http.post(`${this.baseUrl}/create-with-image`, formData)
            .pipe(
                tap((response: any) => {
                    if (response && response.data) {
                        this.projects.update(list => [...list, response.data]);
                        this.projectsSubject.next(this.projects());
                    }
                })
            );
    }

    // Upload project image
    uploadProjectImage(projectId: string, imageFile: File): Observable<any> {
        const formData = new FormData();
        formData.append('projectImage', imageFile);
        
        return this.http.put(`${this.baseUrl}/upload/${projectId}`, formData)
            .pipe(
                tap((response: any) => {
                    if (response && response.data) {
                        this.projects.update(list =>
                            list.map(p => (p._id === projectId ? response.data : p))
                        );
                        this.projectsSubject.next(this.projects());
                    }
                })
            );
    }

    // Update project
    updateProject(id: string, project: Partial<Project>): Observable<any> {
        return this.http.put(`${this.baseUrl}/${id}`, project)
            .pipe(
                tap((response: any) => {
                    if (response) {
                        const updatedProject = response._id ? response : response.data;
                        if (updatedProject) {
                            this.projects.update(list =>
                                list.map(p => (p._id === id ? updatedProject : p))
                            );
                            this.projectsSubject.next(this.projects());
                        }
                    }
                })
            );
    }

    // Delete project
    deleteProject(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${id}`)
            .pipe(
                tap(() => {
                    this.projects.update(list => list.filter(p => p._id !== id));
                    this.projectsSubject.next(this.projects());
                })
            );
    }

    // Legacy methods for backward compatibility
    getProjectsSignal() {
        return this.projects;
    }

    addProject(project: Project) {
        this.projects.update(list => [...list, project]);
        this.projectsSubject.next(this.projects());
    }

    deleteProjectSignal(id: string) {
        this.projects.update(list => list.filter(p => p._id !== id));
        this.projectsSubject.next(this.projects());
    }

    updateProjectSignal(updated: Project) {
        this.projects.update(list =>
            list.map(p => (p._id === updated._id ? updated : p))
        );
        this.projectsSubject.next(this.projects());
    }

    // Load projects from API
    loadProjects(): void {
        this.getProjects().subscribe({
            error: (error) => {
                console.error('Error loading projects:', error);
            }
        });
    }

    // Get projects as observable
    getProjectsObservable(): Observable<Project[]> {
        return this.projectsSubject.asObservable();
    }

    // Clear projects (for logout)
    clearProjects(): void {
        this.projects.set([]);
        this.projectsSubject.next([]);
    }
}
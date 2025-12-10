import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { User } from '../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
    private baseUrl = 'http://localhost:5000/api/users';
    private publicUserId = '693453e12a3b85f45f4499d3';
    private user = signal<User | null>(null);
    private userSubject = new BehaviorSubject<User | null>(null);

    constructor(private http: HttpClient) {}

    // Get current user profile - utilise l'ID fixe
    getUserProfile(): Observable<any> {
        return this.http.get(`${this.baseUrl}/${this.publicUserId}`);
    }

    // Update user profile
    updateUserProfile(userData: Partial<User>): Observable<any> {
        return this.http.put(`${this.baseUrl}/${this.publicUserId}`, userData);
    }

    // Upload profile image
    uploadProfileImage(file: File): Observable<any> {
        const formData = new FormData();
        formData.append('profileImage', file);
        return this.http.put(`${this.baseUrl}/upload/${this.publicUserId}`, formData);
    }

    // Upload CV
    uploadCV(file: File, type: 'uploaded' | 'automatic'): Observable<any> {
        const formData = new FormData();
        formData.append('cv', file);
        formData.append('type', type);
        return this.http.post(`${this.baseUrl}/${this.publicUserId}/upload-cv`, formData);
    }

    // Update skills
    updateSkills(skills: string[]): Observable<any> {
        return this.http.put(`${this.baseUrl}/${this.publicUserId}/skills`, { skills });
    }

    // Update template selection
    updateTemplateSelection(templateId: string): Observable<any> {
        return this.http.put(`${this.baseUrl}/${this.publicUserId}/template`, { templateSelected: templateId });
    }

    // Get social links for user
    getSocialLinks(): Observable<any> {
        return this.http.get(`http://localhost:5000/api/social-links?userId=${this.publicUserId}`);
    }

    // Update social links
    updateSocialLinks(socialLinks: any): Observable<any> {
        return this.http.put(`http://localhost:5000/api/social-links/${this.publicUserId}`, socialLinks);
    }

    // Delete user account
    deleteAccount(): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${this.publicUserId}`);
    }

    // Legacy methods for backward compatibility
    getUser() {
        return this.user;
    }

    updateUser(userData: Partial<User>) {
        this.updateUserSignal(userData);
        // Envoyer aussi au backend
        this.updateUserProfile(userData).subscribe();
    }

    getUserSignal() {
        return this.user;
    }

    updateUserSignal(userData: Partial<User>) {
        const currentUser = this.user();
        if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            this.user.set(updatedUser);
            this.userSubject.next(updatedUser);
        }
    }

    // Load user profile from API
    loadUserProfile(): void {
        // Charger le profil utilisateur
        this.getUserProfile().subscribe({
            next: (userResponse: any) => {
                let userData: User | null = null;
                
                // Gérer différents formats de réponse
                if (userResponse && userResponse._id) {
                    userData = userResponse;
                } else if (userResponse.data) {
                    userData = userResponse.data;
                } else {
                    userData = userResponse;
                }
                
                console.log('Processed User Data:', userData); // AJOUTEZ CE LOG
                console.log('Profile Image:', userData?.profileImage); // AJOUTEZ CE LOG
            

                // Charger les socialLinks séparément
                this.getSocialLinks().subscribe({
                    next: (socialResponse: any) => {
                        if (userData && socialResponse) {
                            // Fusionner les données utilisateur avec les socialLinks
                            const userWithSocial = {
                                ...userData,
                                socialLinks: socialResponse.facebook || socialResponse.github || 
                                           socialResponse.instagram || socialResponse.linkedin ? 
                                           socialResponse : {}
                            };
                            this.user.set(userWithSocial);
                            this.userSubject.next(userWithSocial);
                        } else if (userData) {
                            // Si pas de socialLinks, utiliser objet vide
                            userData.socialLinks = {};
                            this.user.set(userData);
                            this.userSubject.next(userData);
                        }
                    },
                    error: (socialError) => {
                        console.error('Error loading social links:', socialError);
                        // Utiliser les données utilisateur sans socialLinks
                        if (userData) {
                            userData.socialLinks = {};
                            this.user.set(userData);
                            this.userSubject.next(userData);
                        }
                    }
                });
            },
            error: (error) => {
                console.error('Error loading user profile:', error);
                // N'initialiser avec test user que si vraiment nécessaire
                if (!this.user()) {
                    this.initializeTestUser();
                }
            }
        });
    }

    // Get full profile image URL
    getProfileImageUrl(imageName?: string): string {
        if (!imageName) {
            return 'https://i.pravatar.cc/150'; // Image par défaut
        }
        
        // Si le nom d'image est un URL complet, le retourner tel quel
        if (imageName.startsWith('http')) {
            return imageName;
        }
        
        // Solution 1: URL avec timestamp pour éviter le cache
        const timestamp = Date.now();
        const corsUrl = `http://localhost:5000/uploads/${imageName}?t=${timestamp}`;
        
        // Solution 2: Si CORS échoue, utiliser une image de remplacement
        return corsUrl;
    }

    // Méthode pour gérer les erreurs d'image
    handleImageError(): string {
        return 'https://i.pravatar.cc/150';
    }

    // Get user as observable
    getUserObservable(): Observable<User | null> {
        return this.userSubject.asObservable();
    }

    // Get current user ID
    getUserId(): string {
        return this.publicUserId;
    }

    // Initialize with default user for testing
    initializeTestUser(): void {
        const testUser: User = {
            _id: this.publicUserId,
            username: 'emna',
            phone: '123-456-7890',
            location: 'Paris',
            lastName: 'Doe',
            email: 'emnamallek@gmail.com',
            bio: 'Développeur Fullstack',
            skills: ['Angular', 'Node.js', 'MongoDB'],
            profileImage: 'https://i.pravatar.cc/150',
            cvUploaded: '',
            cvAutomatic: '',
            templateSelected: '',
            socialLinks: {
                linkedin: 'https://linkedin.com/in/emna',
                github: 'https://github.com/emna'
            }
        };
        this.user.set(testUser);
        this.userSubject.next(testUser);
    }

    // Clear user data
    clearUser(): void {
        this.user.set(null);
        this.userSubject.next(null);
    }
}
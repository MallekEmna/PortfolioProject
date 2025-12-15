import { Component, Input, OnInit, OnDestroy, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TemplateService } from '../../../../services/template.service';
import { UserService } from '../../../../services/user.service';
import { PortfolioService } from '../../../../services/portfolio.service';
import { ProjectService } from '../../../../services/project.service';
import { PortfolioGeneratorService } from '../../../../services/portfolio-generator.service';
import { Template } from '../../../../core/models/template.model';
import { LucideIconsModule } from '../../../../icons';
import { ProfileSidebarComponent } from '../../../profile/components/profile-sidebar/profile-sidebar';
import { User } from '../../../../core/models/user.model';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-templates',
    standalone: true,
    imports: [CommonModule, RouterModule, LucideIconsModule, ProfileSidebarComponent],
    templateUrl: './templates.html',
})
export class TemplatesPage implements OnInit, OnDestroy {
    @Input() user!: User | null;

    isLoading = signal(true);
    selectedId = signal<string | null>(null);
    templates!: Signal<Template[]>;

    currentUser = computed(() => this.userService.getUserSignal()());

    constructor(
        private templateService: TemplateService,
        public userService: UserService,
        private router: Router,
        private portfolioService: PortfolioService,
        private projectService: ProjectService,
        private portfolioGenerator: PortfolioGeneratorService
    ) {
        // Utilisation de signaux pour la réactivité
        this.templates = toSignal(this.templateService.getTemplatesObservable(), {
            initialValue: []
        });
    }

    ngOnInit() {
        // Charger les templates une seule fois
        this.loadTemplates();
    }

    ngOnDestroy() {
        // Nettoyage automatique avec toSignal
    }

    private loadTemplates() {
        this.isLoading.set(true);
        this.templateService.loadTemplates().subscribe({
            next: (_list: Template[]) => this.isLoading.set(false),
            error: (error: any) => {
                console.error('Error loading templates:', error);
                this.isLoading.set(false);
            }
        });
    }

    customize(id: string | undefined) {
        if (!id) return;
        
        // Trouver le template dans la liste déjà chargée
        const template = this.templates().find(t => t._id === id);
        
        if (template) {
            // Passer le template via le state pour éviter le rechargement
            this.router.navigate(['/templates', id], {
                state: { template: template }
            });
        } else {
            // Si le template n'est pas dans la liste, naviguer normalement
            this.router.navigate(['/templates', id]);
        }
    }

    selectTemplateForUse(id: string | undefined) {
        if (!id) return;
        this.selectedId.set(id);
        this.templateService.selectForUse(id);
    }

    finalizeSelection() {
        const selectedId = this.selectedId();
        if (!selectedId) return;

        this.isLoading.set(true);

        // Récupérer le template sélectionné
        const selectedTemplate = this.templates().find(t => t._id === selectedId);
        if (!selectedTemplate) {
            this.showError('Template non trouvé');
            this.isLoading.set(false);
            return;
        }

        // Récupérer les données utilisateur et projets en parallèle
        const user = this.currentUser();
        
        const projects$ = this.projectService.getProjects().pipe(
            map((response: any) => Array.isArray(response) ? response : (response?.data || [])),
            catchError(() => of([]))
        );
        
        const userProfile$ = user 
            ? of(user)
            : this.userService.getUserProfile().pipe(
                map((response: any) => response?.data || response),
                catchError(() => of(null))
            );
        
        forkJoin({
            projects: projects$,
            userProfile: userProfile$
        }).subscribe({
            next: ({ projects, userProfile }) => {
                // Préparer les données
                const userData = userProfile;
                const projectsList = projects;

                // Générer le HTML du portfolio
                const htmlContent = this.portfolioGenerator.generatePortfolioHTML(
                    selectedTemplate,
                    userData,
                    projectsList
                );

                // Vérifier que le HTML est généré
                if (!htmlContent || htmlContent.trim().length === 0) {
                    this.showError('Erreur: Le HTML du portfolio n\'a pas pu être généré.');
                    this.isLoading.set(false);
                    return;
                }

                console.log('HTML Content generated, length:', htmlContent.length);

                // Créer le portfolio
                const portfolioData = {
                    templateId: selectedId,
                    htmlContent: htmlContent,
                    title: `${userData?.username || 'Mon'} Portfolio`,
                    description: `Portfolio généré avec le template ${selectedTemplate.name}`,
                    userId: this.userService.getUserId()
                };

                console.log('Portfolio data to send:', {
                    ...portfolioData,
                    htmlContent: htmlContent.substring(0, 100) + '...' // Log only first 100 chars
                });

                // 1. Mettre à jour la sélection du template pour l'utilisateur (en parallèle avec la création du portfolio)
                const updateTemplate$ = this.userService.updateTemplateSelection(selectedId).pipe(
                    catchError((error) => {
                        console.warn('Error updating template selection (non-blocking):', error);
                        // Ne pas bloquer si la mise à jour du template échoue
                        return of(null);
                    })
                );

                // 2. Créer ou mettre à jour le portfolio
                const createPortfolio$ = this.portfolioService.createPortfolio(portfolioData);

                // Exécuter les deux opérations en parallèle
                forkJoin({
                    templateUpdate: updateTemplate$,
                    portfolio: createPortfolio$
                }).subscribe({
                    next: ({ templateUpdate, portfolio: portfolioResponse }) => {
                        const portfolio = portfolioResponse.data || portfolioResponse;
                        
                        // Rafraîchir les templates
                        this.loadTemplates();
                        
                        // Mettre à jour le signal utilisateur
                        if (templateUpdate) {
                            this.userService.updateUserSignal({ templateSelected: selectedId });
                        }

                        this.templateService.selectForUse(null);
                        this.selectedId.set(null);
                        this.isLoading.set(false);

                        // Notification de succès
                        const isUpdate = portfolioResponse.status === 200 || portfolioResponse.status === 201;
                        this.showSuccess(
                            `Portfolio ${isUpdate ? 'mis à jour' : 'généré'} avec succès! ` +
                            `URL publique: ${portfolio.publicUrl || 'N/A'}`
                        );

                        console.log('Portfolio créé/mis à jour:', portfolio);
                        
                        // Rediriger vers la page de visualisation du portfolio
                        setTimeout(() => {
                            this.router.navigate(['/portfolio', portfolio._id]);
                        }, 1500);
                    },
                    error: (error: any) => {
                        console.error('Error creating/updating portfolio:', error);
                        this.isLoading.set(false);
                        this.showError('Erreur lors de la création/mise à jour du portfolio.');
                    }
                });
            },
            error: (error: any) => {
                console.error('Error loading data for portfolio generation:', error);
                this.isLoading.set(false);
                this.showError('Erreur lors du chargement des données. Veuillez réessayer.');
            }
        });
    }

    private showSuccess(message: string) {
        // Vous pouvez utiliser un service de notification ici
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideIn';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('animate-slideOut');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    private showError(message: string) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideIn';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('animate-slideOut');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getTemplateStatus(templateId: string): 'selected' | 'active' | 'inactive' {
        const userTemplate = this.currentUser()?.templateSelected;
        if (userTemplate === templateId) return 'active';
        if (this.selectedId() === templateId) return 'selected';
        return 'inactive';
    }
}
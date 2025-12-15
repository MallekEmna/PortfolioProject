import { Component, Input, OnInit, OnDestroy, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioService } from '../../../../services/portfolio.service';
import { Portfolio } from '../../../../core/models/portfolio.model';
import { ProfileSidebarComponent } from '../../../profile/components/profile-sidebar/profile-sidebar';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../core/models/user.model';
import { computed } from '@angular/core';
import { PortfolioGeneratorService } from '../../../../services/portfolio-generator.service';
import { ProjectService } from '../../../../services/project.service';
import { TemplateService } from '../../../../services/template.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-portfolio-viewer',
    standalone: true,
    imports: [CommonModule, ProfileSidebarComponent],
    templateUrl: './portfolio-viewer.html',
    styleUrls: ['./portfolio-viewer.scss']
})
export class PortfolioViewerComponent implements OnInit, OnChanges, OnDestroy {
    @Input() portfolioId?: string;
    @Input() publicUrl?: string;
    @Input() portfolio?: Portfolio;

    portfolioData = signal<Portfolio | null>(null);
    htmlContent = signal<SafeHtml | null>(null);
    isLoading = signal(true);
    error = signal<string | null>(null);
    showProjectModal = signal(false);
    selectedProject = signal<any>(null);
    projects = signal<any[]>([]);

    currentUser = computed(() => this.userService.getUserSignal()());

    constructor(
        private portfolioService: PortfolioService,
        private sanitizer: DomSanitizer,
        private route: ActivatedRoute,
        private router: Router,
        public userService: UserService,
        private portfolioGenerator: PortfolioGeneratorService,
        private projectService: ProjectService,
        private templateService: TemplateService
    ) { }

    ngOnInit() {
        // Écouter les événements de clic sur les projets depuis le HTML généré
        if (typeof window !== 'undefined') {
            window.addEventListener('portfolio-project-click', this.handleProjectClick.bind(this) as EventListener);
        }

        // Si portfolioId ou publicUrl dans la route
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.portfolioId = params['id'];
                this.loadPortfolio();
            }
        });

        this.route.queryParams.subscribe(params => {
            if (params['url']) {
                this.publicUrl = params['url'];
                this.loadPortfolioByUrl();
            }
        });

        // Si portfolio passé en input
        if (this.portfolio) {
            this.portfolioData.set(this.portfolio);
            this.renderPortfolio(this.portfolio);
        } else if (this.portfolioId) {
            this.loadPortfolio();
        } else if (this.publicUrl) {
            this.loadPortfolioByUrl();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['portfolio'] && changes['portfolio'].currentValue) {
            this.portfolioData.set(changes['portfolio'].currentValue);
            this.renderPortfolio(changes['portfolio'].currentValue);
        }
    }

    ngOnDestroy() {
        // Nettoyer les événements
        if (typeof window !== 'undefined') {
            window.removeEventListener('portfolio-project-click', this.handleProjectClick.bind(this) as EventListener);
        }
    }

    handleProjectClick(event: any) {
        const projectIndex = event.detail?.index;
        if (projectIndex !== undefined && this.projects().length > projectIndex) {
            this.selectedProject.set(this.projects()[projectIndex]);
            this.showProjectModal.set(true);
            document.body.style.overflow = 'hidden';
        }
    }

    closeProjectModal() {
        this.showProjectModal.set(false);
        this.selectedProject.set(null);
        document.body.style.overflow = '';
    }

    isArray(value: any): boolean {
        return Array.isArray(value);
    }

    getTechStackArray(techStack: any): string[] {
        if (Array.isArray(techStack)) {
            return techStack;
        } else if (typeof techStack === 'string') {
            return techStack.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
        }
        return [];
    }

    loadPortfolio() {
        if (!this.portfolioId) return;

        this.isLoading.set(true);
        this.error.set(null);

        this.portfolioService.getPortfolioById(this.portfolioId).subscribe({
            next: (response: any) => {
                const portfolio = response.data || response;
                console.log('Portfolio loaded:', portfolio);
                console.log('HTML Content length:', portfolio?.htmlContent?.length);

                if (!portfolio) {
                    this.error.set('Portfolio non trouvé');
                    this.isLoading.set(false);
                    return;
                }

                this.portfolioData.set(portfolio);

                // Charger les projets pour la modale
                this.loadProjectsForModal();

                this.renderPortfolio(portfolio);
                this.isLoading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading portfolio:', err);
                this.error.set('Erreur lors du chargement du portfolio');
                this.isLoading.set(false);
            }
        });
    }

    private loadProjectsForModal() {
        this.projectService.getProjects().subscribe({
            next: (response: any) => {
                const projectsList = Array.isArray(response) ? response : (response?.data || []);
                this.projects.set(projectsList);
            },
            error: (err: any) => {
                console.error('Error loading projects for modal:', err);
            }
        });
    }

    loadPortfolioByUrl() {
        if (!this.publicUrl) return;

        this.isLoading.set(true);
        this.error.set(null);

        this.portfolioService.getPublicPortfolio(this.publicUrl).subscribe({
            next: (response: any) => {
                const portfolio = response.data || response;
                this.portfolioData.set(portfolio);

                // Charger les projets pour la modale
                this.loadProjectsForModal();

                this.renderPortfolio(portfolio);
                this.isLoading.set(false);
            },
            error: (err: any) => {
                console.error('Error loading portfolio by URL:', err);
                this.error.set('Portfolio non trouvé');
                this.isLoading.set(false);
            }
        });
    }

    renderPortfolio(portfolio: Portfolio) {
        if (!portfolio) {
            console.error('Portfolio is null or undefined');
            this.error.set('Portfolio non disponible');
            return;
        }

        if (!portfolio.htmlContent) {
            console.error('HTML content is missing in portfolio:', portfolio);
            this.error.set('Contenu du portfolio non disponible');
            return;
        }

        console.log('Rendering portfolio with HTML content length:', portfolio.htmlContent.length);

        // Sanitize le HTML pour la sécurité et l'afficher
        try {
            this.htmlContent.set(this.sanitizer.bypassSecurityTrustHtml(portfolio.htmlContent));
            console.log('HTML content set successfully');
        } catch (error) {
            console.error('Error setting HTML content:', error);
            this.error.set('Erreur lors du rendu du portfolio');
        }
    }

    editPortfolio() {
        if (this.portfolioData()?._id) {
            this.router.navigate(['/portfolio', this.portfolioData()?._id, 'edit']);
        }
    }

    publishPortfolio() {
        const portfolio = this.portfolioData();
        if (!portfolio?._id) return;

        this.portfolioService.publishPortfolio(portfolio._id).subscribe({
            next: (response: any) => {
                const updated = response.data || response;
                this.portfolioData.set(updated);
                console.log('Portfolio publié:', updated);
            },
            error: (err: any) => {
                console.error('Error publishing portfolio:', err);
            }
        });
    }



    refreshPreview() {
        // Recharger le portfolio pour actualiser l'affichage
        if (this.portfolioId) {
            this.loadPortfolio();
        } else if (this.publicUrl) {
            this.loadPortfolioByUrl();
        } else if (this.portfolioData()) {
            // Si on a déjà les données, juste re-rendre
            this.renderPortfolio(this.portfolioData()!);
        }
    }

    goToTemplates() {
        // Naviguer vers la sélection de template
        this.router.navigate(['/templates']);
    }

    regeneratePortfolio() {
        const portfolio = this.portfolioData();
        if (!portfolio || !portfolio.templateId) {
            this.showError('Impossible de régénérer le portfolio : template manquant');
            return;
        }

        this.isLoading.set(true);
        const templateId = typeof portfolio.templateId === 'string'
            ? portfolio.templateId
            : (portfolio.templateId as any)?._id;

        if (!templateId) {
            this.showError('Template ID non trouvé');
            this.isLoading.set(false);
            return;
        }

        // Récupérer le template, les projets et l'utilisateur
        const template$ = this.templateService.getTemplateById(templateId).pipe(
            map((response: any) => response?.data || response),
            catchError(() => of(null))
        );

        const projects$ = this.projectService.getProjects().pipe(
            map((response: any) => {
                const projectsList = Array.isArray(response) ? response : (response?.data || []);
                // Stocker les projets pour la modale
                this.projects.set(projectsList);
                return projectsList;
            }),
            catchError(() => of([]))
        );

        const userProfile$ = this.currentUser()
            ? of(this.currentUser())
            : this.userService.getUserProfile().pipe(
                map((response: any) => response?.data || response),
                catchError(() => of(null))
            );

        forkJoin({
            template: template$,
            projects: projects$,
            userProfile: userProfile$
        }).subscribe({
            next: ({ template, projects, userProfile }) => {
                if (!template) {
                    this.showError('Template non trouvé');
                    this.isLoading.set(false);
                    return;
                }

                // Générer le nouveau HTML
                const htmlContent = this.portfolioGenerator.generatePortfolioHTML(
                    template,
                    userProfile,
                    projects
                );

                if (!htmlContent || htmlContent.trim().length === 0) {
                    this.showError('Erreur lors de la génération du HTML');
                    this.isLoading.set(false);
                    return;
                }

                // Mettre à jour le portfolio
                const updateData = {
                    htmlContent: htmlContent,
                    title: portfolio.title || `${userProfile?.username || 'Mon'} Portfolio`,
                    description: portfolio.description || `Portfolio généré avec le template ${template.name}`
                };

                if (portfolio._id) {
                    this.portfolioService.updatePortfolio(portfolio._id, updateData).subscribe({
                        next: (response: any) => {
                            const updated = response?.data || response;
                            this.portfolioData.set(updated);
                            this.renderPortfolio(updated);
                            this.isLoading.set(false);
                            this.showSuccess('Portfolio régénéré avec succès !');
                        },
                        error: (err: any) => {
                            console.error('Error regenerating portfolio:', err);
                            this.showError('Erreur lors de la régénération du portfolio');
                            this.isLoading.set(false);
                        }
                    });
                } else {
                    this.showError('Portfolio ID manquant');
                    this.isLoading.set(false);
                }
            },
            error: (error: any) => {
                console.error('Error loading data for regeneration:', error);
                this.showError('Erreur lors du chargement des données');
                this.isLoading.set(false);
            }
        });
    }

    private showSuccess(message: string) {
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
}


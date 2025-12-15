import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TemplateService } from '../../../../services/template.service';
import { User } from '../../../../core/models/user.model';
import { Template } from '../../../../core/models/template.model';
import { LucideIconsModule } from '../../../../icons';
import { ProfileSidebarComponent } from '../../../profile/components/profile-sidebar/profile-sidebar';
import { PortfolioService } from '../../../../services/portfolio.service';
import { PortfolioGeneratorService } from '../../../../services/portfolio-generator.service';
import { ProjectService } from '../../../../services/project.service';
import { UserService } from '../../../../services/user.service';
import { forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
    selector: 'app-template-editor',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, LucideIconsModule, ProfileSidebarComponent],
    templateUrl: './template-editor.html',
})
export class TemplateEditor implements OnInit {

    @Input() user!: User | null;

    template: Template | null = null;
    colorsInput = '';
    sectionsInput = '';
    availableSections: string[] = [
        'summary',
        'about',
        'experience',
        'education',
        'projects',
        'skills',
        'certifications',
        'languages',
        'interests',
        'contact'
    ];
    isLoading = false;

    constructor(
        private route: ActivatedRoute, 
        private router: Router, 
        private service: TemplateService,
        private portfolioService: PortfolioService,
        private portfolioGenerator: PortfolioGeneratorService,
        private projectService: ProjectService,
        private userService: UserService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/templates']);
            return;
        }

        // Vérifier si le template est passé via le state (navigation depuis la liste)
        // Vérifier si window existe (pour éviter l'erreur SSR)
        let templateFromState = null;
        if (typeof window !== 'undefined' && window.history?.state) {
            templateFromState = window.history.state.template;
        }
        
        if (templateFromState && templateFromState._id === id) {
            // Utiliser le template déjà chargé - pas besoin de recharger
            this.setTemplate(templateFromState);
            this.isLoading = false;
        } else {
            // Charger le template depuis l'API si pas dans le state
            this.isLoading = true;
            this.service.getTemplateById(id).subscribe({
                next: (response: any) => {
                    const tpl = response?.data ?? response;
                    this.setTemplate(tpl);
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading template', error);
                    this.isLoading = false;
                    this.router.navigate(['/templates']);
                }
            });
        }
    }

    private setTemplate(tpl: Template | null) {
        if (!tpl) {
            this.router.navigate(['/templates']);
            return;
        }
        const layout = tpl.layout ?? { sections: [], theme: 'light' };
        this.template = {
            ...tpl,
            colors: tpl.colors ?? [],
            layout: {
                ...layout,
                sections: layout.sections ?? [],
                theme: layout.theme ?? 'light'
            }
        };
        this.colorsInput = (this.template.colors ?? []).join(', ');
        this.sectionsInput = (this.template.layout?.sections ?? []).join(', ');
    }

    save() {
        if (!this.template || !this.template._id) return;
        // normalize
        this.template.colors = (this.template.colors || []).map(c => c.trim()).filter(Boolean);
        this.template.layout.sections = (this.template.layout.sections || []).map(s => s.trim()).filter(Boolean);

        this.isLoading = true;

        this.service.updateTemplate(this.template._id, this.template).subscribe({
            next: (response: any) => {
                const updated = response?.data ?? this.template;
                this.service.updateTemplateSignal(updated as Template);
                
                // Régénérer le portfolio si l'utilisateur a un portfolio avec ce template
                this.regeneratePortfolioIfNeeded(updated as Template);
            },
            error: (error) => {
                console.error('Error updating template', error);
                this.isLoading = false;
                this.showError('Erreur lors de la mise à jour du template');
            }
        });
    }

    private regeneratePortfolioIfNeeded(updatedTemplate: Template) {
        // Vérifier si l'utilisateur a un portfolio avec ce template
        this.portfolioService.getUserPortfolios().subscribe({
            next: (response: any) => {
                const portfolios = response?.data || [];
                const userPortfolio = portfolios.find((p: any) => {
                    const templateId = typeof p.templateId === 'string' 
                        ? p.templateId 
                        : p.templateId?._id;
                    return templateId === updatedTemplate._id;
                });

                if (userPortfolio) {
                    // Régénérer le portfolio avec le template mis à jour
                    this.regeneratePortfolio(userPortfolio, updatedTemplate);
                } else {
                    this.isLoading = false;
                    this.router.navigate(['/templates']);
                    this.showSuccess('Template mis à jour avec succès');
                }
            },
            error: (error) => {
                console.error('Error checking portfolios:', error);
                this.isLoading = false;
                this.router.navigate(['/templates']);
                this.showSuccess('Template mis à jour avec succès');
            }
        });
    }

    private regeneratePortfolio(portfolio: any, template: Template) {
        // Récupérer les projets et l'utilisateur
        const projects$ = this.projectService.getProjects().pipe(
            map((response: any) => Array.isArray(response) ? response : (response?.data || [])),
            catchError(() => of([]))
        );

        const userProfile$ = this.userService.getUserProfile().pipe(
            map((response: any) => response?.data || response),
            catchError(() => of(null))
        );

        forkJoin({
            projects: projects$,
            userProfile: userProfile$
        }).subscribe({
            next: ({ projects, userProfile }) => {
                // Générer le nouveau HTML
                const htmlContent = this.portfolioGenerator.generatePortfolioHTML(
                    template,
                    userProfile,
                    projects
                );

                if (!htmlContent || htmlContent.trim().length === 0) {
                    this.isLoading = false;
                    this.router.navigate(['/templates']);
                    this.showSuccess('Template mis à jour. Erreur lors de la régénération du portfolio.');
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
                        next: () => {
                            this.isLoading = false;
                            this.router.navigate(['/templates']);
                            this.showSuccess('Template mis à jour et portfolio régénéré avec succès !');
                        },
                        error: (err: any) => {
                            console.error('Error regenerating portfolio:', err);
                            this.isLoading = false;
                            this.router.navigate(['/templates']);
                            this.showSuccess('Template mis à jour. Erreur lors de la régénération du portfolio.');
                        }
                    });
                } else {
                    this.isLoading = false;
                    this.router.navigate(['/templates']);
                    this.showSuccess('Template mis à jour avec succès');
                }
            },
            error: (error: any) => {
                console.error('Error loading data for regeneration:', error);
                this.isLoading = false;
                this.router.navigate(['/templates']);
                this.showSuccess('Template mis à jour avec succès');
            }
        });
    }

    private showSuccess(message: string) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    private showError(message: string) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    cancel() {
        this.router.navigate(['/templates']);
    }

    addColor() {
        if (!this.template) return;
        const fallback = '#0ea5e9'; // teal-400 default
        this.template.colors = [...(this.template.colors ?? []), fallback];
    }

    removeColor(index: number) {
        if (!this.template) return;
        const next = [...(this.template.colors ?? [])];
        next.splice(index, 1);
        this.template.colors = next;
    }

    isSectionSelected(section: string): boolean {
        return !!this.template?.layout.sections?.includes(section);
    }

    toggleSection(section: string, checked: boolean) {
        if (!this.template) return;
        const current = new Set(this.template.layout.sections ?? []);
        if (checked) {
            current.add(section);
        } else {
            current.delete(section);
        }
        this.template.layout.sections = Array.from(current);
    }

}
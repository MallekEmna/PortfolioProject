import { Component, Input, OnInit, OnDestroy, signal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TemplateService } from '../../../../services/template.service';
import { UserService } from '../../../../services/user.service';
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
        this.router.navigate(['/templates', id]);
    }

    selectTemplateForUse(id: string | undefined) {
        if (!id) return;
        this.selectedId.set(id);
        this.templateService.selectForUse(id);
    }

    finalizeSelection() {
        const selectedId = this.selectedId();
        if (!selectedId) return;

        this.userService.updateTemplateSelection(selectedId).subscribe({
            next: (_response: any) => {
                // Rafraîchir les templates pour voir le changement
                this.loadTemplates();
                // Mettre à jour le signal utilisateur localement
                this.userService.updateUserSignal({ templateSelected: selectedId });

                this.templateService.selectForUse(null);
                this.selectedId.set(null);

                // Notification plus élégante
                this.showSuccess('Template applied successfully! Portfolio generation started.');
            },
            error: (error: any) => {
                console.error('Error applying template:', error);
                this.showError('Failed to apply template. Please try again.');
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
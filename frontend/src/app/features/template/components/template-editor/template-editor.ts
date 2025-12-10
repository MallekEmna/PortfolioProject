import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { TemplateService } from '../../../../services/template.service';
import { User } from '../../../../core/models/user.model';
import { Template } from '../../../../core/models/template.model';
import { LucideIconsModule } from '../../../../icons';
import { ProfileSidebarComponent } from '../../../profile/components/profile-sidebar/profile-sidebar';

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

    constructor(private route: ActivatedRoute, private router: Router, private service: TemplateService) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.router.navigate(['/templates']);
            return;
        }

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

        this.service.updateTemplate(this.template._id, this.template).subscribe({
            next: (response: any) => {
                const updated = response?.data ?? this.template;
                this.service.updateTemplateSignal(updated as Template);
                this.router.navigate(['/templates']);
            },
            error: (error) => {
                console.error('Error updating template', error);
            }
        });
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
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../../../icons';
import { SocialLinks } from '../../../../core/models/socialLinks.model';
import { UserService } from '../../../../services/user.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-social-media-section',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIconsModule],
  templateUrl: './social-media-section.html',
  styleUrls: ['./social-media-section.scss'], // corrigé styleUrls
})
export class SocialMediaSection {
  @Input() user!: User | null; // reçoit le user du composant parent
  editMode = false;             // mode édition
  tempLinks: SocialLinks = {};  // liens temporaires pour édition

  constructor(private userService: UserService) { }
ngOnInit() {
    console.log('🔍 SocialMediaSection - User input:', this.user);
    console.log('🔍 SocialMediaSection - Social Links:', this.user?.socialLinks);
}

// Activer le mode édition
enableEdit() {
    console.log('✏️ Enabling edit mode');
    console.log('✏️ Current social links:', this.user?.socialLinks);
    
    this.editMode = true;
    this.tempLinks = { 
        linkedin: this.user?.socialLinks?.linkedin || '',
        github: this.user?.socialLinks?.github || '',
        facebook: this.user?.socialLinks?.facebook || '',
        instagram: this.user?.socialLinks?.instagram || ''
    };
    
    console.log('✏️ Temp links for editing:', this.tempLinks);
}

  // Sauvegarder les modifications
  save() {
    if (!this.user) return;

    // mise à jour côté service avec la nouvelle méthode
    this.userService.updateSocialLinks(this.tempLinks).subscribe({
      next: (response: any) => {
        if (response.success) {
          // mise à jour locale
          if (this.user) {
            this.user.socialLinks = { ...this.tempLinks };
          }
          this.editMode = false;
        }
      },
      error: (error) => {
        console.error('Error updating social links:', error);
        // En cas d'erreur, mettre à jour localement quand même
        if (this.user) {
          this.user.socialLinks = { ...this.tempLinks };
        }
        this.editMode = false;
      }
    });
  }

  // Annuler les modifications
  cancel() {
    if (!this.user) return;
    this.tempLinks = { ...this.user?.socialLinks };
    this.editMode = false;
  }
}

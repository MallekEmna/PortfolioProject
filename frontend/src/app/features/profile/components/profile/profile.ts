import { Component, signal } from '@angular/core';
import { SocialMediaSection } from '../social-media-section/social-media-section';
import { SkillsSection } from '../skills-section/skills-section';
import { PersonalInfoForm } from '../personal-info-form/personal-info-form';
import { ProfileSidebarComponent } from '../profile-sidebar/profile-sidebar';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-profile',
  imports: [ProfileSidebarComponent, PersonalInfoForm, SkillsSection, SocialMediaSection],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile {

  user = signal<User | null>(null);

  constructor(private userService: UserService) { }

  ngOnInit() {
    // Charger l'utilisateur depuis l'API
    this.userService.loadUserProfile();
    
    // S'abonner aux changements pour mettre à jour l'affichage
    this.userService.getUserObservable().subscribe(user => {
      this.user.set(user);
    });
    
    // Valeur initiale seulement si aucune donnée n'existe déjà
    const existingUser = this.userService.getUser()();
    if (!existingUser) {
      this.user.set(null);
    }
  }
}

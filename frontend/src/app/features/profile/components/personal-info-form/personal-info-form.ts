import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideIconsModule } from '../../../../icons';
import { User } from '../../../../core/models/user.model';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-personal-info-form',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideIconsModule],
  templateUrl: './personal-info-form.html',
  styleUrls: ['./personal-info-form.scss'],
})
export class PersonalInfoForm {

  @Input() user!: User | null;
  editMode = signal(false);

  // signal pour la copie temporaire lors de l’édition
  tempUser = signal<User | null>(null);

  constructor(private userService: UserService) { }

  ngOnInit() {
    // Utiliser l'utilisateur fourni ou le charger depuis le service
    if (!this.user) {
      // récupère la valeur initiale du signal
      const initialUser = this.userService.getUser()();
      if (initialUser) {
        this.user = initialUser;
      } else {
        // Initialize with test data if user is null
        this.userService.initializeTestUser();
        this.user = this.userService.getUser()();
      }
    }
  }

  enableEdit() {
    this.editMode.set(true);
    this.tempUser.set({ ...this.user! });
  }

  save() {
    if (!this.tempUser()) return;

    // update via le service
    this.userService.updateUser(this.tempUser()!);

    this.editMode.set(false);
  }

  cancel() {
    this.editMode.set(false);
    this.tempUser.set(null);
  }

  // Helper methods for safe ngModelChange handling
  onUsernameChange(value: string) {
    const temp = this.tempUser();
    if (temp) {
      this.tempUser.set({ ...temp, username: value });
    }
  }

  onLastNameChange(value: string) {
    const temp = this.tempUser();
    if (temp) {
      this.tempUser.set({ ...temp, lastName: value });
    }
  }

  onPhoneChange(value: string) {
    const temp = this.tempUser();
    if (temp) {
      this.tempUser.set({ ...temp, phone: value });
    }
  }

  onLocationChange(value: string) {
    const temp = this.tempUser();
    if (temp) {
      this.tempUser.set({ ...temp, location: value });
    }
  }

onUploadPhoto(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    console.log('Uploading file:', file.name);
    
    this.userService.uploadProfileImage(file).subscribe({
      next: (response: any) => {
        console.log('Image uploaded successfully:', response);
        
        // Mettre à jour l'utilisateur avec la nouvelle image
        if (response.profileImage) {
          this.userService.updateUser({ profileImage: response.profileImage });
        }
        
        // Réinitialiser l'input
        input.value = '';
      },
      error: (error) => {
        console.error('Upload failed:', error);
        alert('Erreur lors de l\'upload de l\'image');
        input.value = '';
      }
    });
  }
}
removePhoto() {
  this.userService.updateUser({ profileImage: '' });
}
}

import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Project } from '../../../../core/models/project.model';
import { ProjectService } from '../../../../services/project.service';
import { ImageUrlService } from '../../../../shared/services/image-url.service';

@Component({
  selector: 'app-add-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-project.html',
  styleUrls: ['./add-project.scss'],
})
export class AddProject {
  @Output() projectAdded = new EventEmitter<Project>();
  project: Project = {
    title: '',
    description: '',
    techStack: [],
    companyName: '',
    duration: '',
    category: ''
  };

  techInput = '';
  selectedImageFile: File | null = null;
  selectedImagePreview: string | ArrayBuffer | null = null;

  constructor(private projectService: ProjectService, private imageUrlService: ImageUrlService) {}

  addTech() {
    if (this.techInput.trim()) {
      this.project.techStack.push(this.techInput.trim());
      this.techInput = '';
    }
  }
  
  removeTech(index: number) {
    this.project.techStack.splice(index, 1);
  }

  submit() {
    // Utiliser le service avec FormData si une image est sélectionnée
    if (this.selectedImageFile) {
      this.projectService.createProjectWithImage(this.project, this.selectedImageFile)
        .subscribe({
          next: (response) => {
            console.log('Projet créé avec image:', response);
            this.resetForm();
            this.projectAdded.emit(response.data);
          },
          error: (error) => {
            console.error('Erreur lors de la création du projet:', error);
          }
        });
    } else {
      // Création sans image
      this.projectAdded.emit(this.project);
      this.resetForm();
    }
  }

  resetForm() {
    this.project = { title: '', description: '', techStack: [], companyName: '', duration: '', category: '' };
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    this.techInput = '';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Vérifier que c'est bien une image
      if (!file.type.startsWith('image/')) {
        console.error('Le fichier sélectionné n\'est pas une image');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        console.error('L\'image est trop grande (max 5MB)');
        return;
      }
      
      this.selectedImageFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePreview = e.target.result;
        console.log('Image chargée:', this.selectedImagePreview ? 'succès' : 'échec');
      };
      reader.onerror = (error) => {
        console.error('Erreur lors de la lecture du fichier:', error);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
  }

  // Méthode pour construire l'URL complète d'une image
  getImageUrl(imagePath?: string): string {
    return this.imageUrlService.getImageUrl(imagePath);
  }
}

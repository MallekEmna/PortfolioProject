import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Project } from '../../../../core/models/project.model';
import { ProjectService } from '../../../../services/project.service';
import { ImageUrlService } from '../../../../shared/services/image-url.service';

@Component({
  selector: 'app-edite-project',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edite-project.html',
  styleUrls: ['./edite-project.scss'],
})
export class EditeProject implements OnInit {
  @Input() project!: Project;
  @Output() projectUpdated = new EventEmitter<Project>();
  @Output() close = new EventEmitter<void>();
  
  techStackInput = '';
  selectedImageFile: File | null = null;
  selectedImagePreview: string | ArrayBuffer | null = null;
  editedProject!: Project;
  isLoading = false;

  constructor(
    private projectService: ProjectService, 
    private imageUrlService: ImageUrlService
  ) {}

  getImageUrl(imagePath?: string): string {
    return this.imageUrlService.getImageUrl(imagePath);
  }

  ngOnInit(): void {
    console.log('📋 EditProject initialized with project:', this.project);
    // Créer une copie profonde
    this.editedProject = JSON.parse(JSON.stringify(this.project));
    this.techStackInput = (this.editedProject?.techStack ?? []).join(', ');
    
    // Précharger l'image existante si elle existe
    if (this.editedProject?.image && !this.editedProject.image.startsWith('data:')) {
      this.selectedImagePreview = this.getImageUrl(this.editedProject.image);
    } else if (this.editedProject?.image) {
      this.selectedImagePreview = this.editedProject.image;
    }
  }

  submit() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    // Normaliser tech stack
    this.editedProject.techStack = (this.techStackInput || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    
    console.log('📤 Submitting edited project:', this.editedProject);
    
    // Si une nouvelle image a été sélectionnée
    if (this.selectedImageFile) {
      this.projectService.uploadProjectImage(this.editedProject._id!, this.selectedImageFile)
        .subscribe({
          next: (response) => {
            console.log('✅ Image uploaded:', response);
            if (response && response.data) {
              // Fusionner les données de l'image avec le projet
              const finalProject = {
                ...this.editedProject,
                image: response.data.image || this.editedProject.image
              };
              this.projectUpdated.emit(finalProject);
            } else {
              this.projectUpdated.emit(this.editedProject);
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('❌ Image upload error:', error);
            this.isLoading = false;
            // En cas d'erreur d'upload, envoyer quand même les autres modifications
            this.projectUpdated.emit(this.editedProject);
          }
        });
    } else {
      // Si on a supprimé l'image
      if (!this.selectedImagePreview && !this.editedProject.image) {
        this.editedProject.image = '';
      }
      
      // Mettre à jour le projet directement
      this.projectUpdated.emit(this.editedProject);
      this.isLoading = false;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      this.selectedImageFile = file;
      
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePreview = e.target.result;
        // Mettre à jour l'image temporairement pour l'affichage
        this.editedProject.image = e.target.result as string;
      };
      reader.onerror = (error) => {
        console.error('File reading error:', error);
        alert('Error reading file');
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImageFile = null;
    this.selectedImagePreview = null;
    this.editedProject.image = '';
  }

  onImageError(event: any) {
    console.error('Image load error:', event.target.src);
    event.target.style.display = 'none';
  }

  cancel() {
    this.close.emit();
  }
}
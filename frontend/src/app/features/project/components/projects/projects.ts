import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, OnInit, signal, Signal, computed } from '@angular/core';
import { ProjectsHeader } from '../projects-header/projects-header';
import { Project } from '../../../../core/models/project.model';
import { ProjectService } from '../../../../services/project.service';
import { UserService } from '../../../../services/user.service';
import { ProjectsGrid } from '../projects-grid/projects-grid';
import { ProfileSidebarComponent } from '../../../profile/components/profile-sidebar/profile-sidebar';
import { User } from '../../../../core/models/user.model';
import { AddProject } from '../add-project/add-project';
import { EditeProject } from '../edite-project/edite-project';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    ProjectsHeader,
    ProjectsGrid,
    ProfileSidebarComponent,
    AddProject,
    EditeProject
  ],
  templateUrl: './projects.html',
  styleUrls: ['./projects.scss'],
})
export class Projects implements OnInit {
  @Input() user!: User | null;

  projects: Signal<Project[]>;
  showAddForm = signal(false);
  showEditModal = signal(false);
  selectedProject = signal<Project | null>(null);
  currentUser = computed(() => this.userService.getUserSignal()());

  constructor(
    private projectService: ProjectService, 
    public userService: UserService
  ) {
    this.projects = this.projectService.getProjectsSignal();
  }

  ngOnInit() {
    this.loadUserProjects();
  }

  private loadUserProjects() {
    this.projectService.loadProjects();
  }

  addNewProject() {
    this.showAddForm.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeAddModal() {
    this.showAddForm.set(false);
    document.body.style.overflow = '';
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedProject.set(null);
    document.body.style.overflow = '';
  }

  onProjectAdded(newProject: Project) {
    console.log('📝 Adding project:', newProject);
    
    if (newProject.image && newProject.image.startsWith('data:')) {
      this.projectService.createProjectWithImage(newProject).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.closeAddModal();
          } else {
            console.error('Create project failed:', response.message);
          }
        },
        error: (error) => {
          console.error('Error creating project:', error);
        }
      });
    } else {
      this.projectService.createProject(newProject).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.closeAddModal();
          } else {
            console.error('Create project failed:', response.message);
          }
        },
        error: (error) => {
          console.error('Error creating project:', error);
        }
      });
    }
  }

  editProject(project: Project) {
    // Créer une copie profonde du projet
    const projectCopy = JSON.parse(JSON.stringify(project));
    this.selectedProject.set(projectCopy);
    this.showEditModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  onProjectUpdated(updatedProject: Project) {
    console.log('🔄 Project updated:', updatedProject);
    
    // Mettre à jour via le service
    this.projectService.updateProject(updatedProject._id!, updatedProject).subscribe({
      next: (response: any) => {
        console.log('✅ Update response:', response);
        
        // Fermer la modal
        this.closeEditModal();
        
        // Rafraîchir les projets depuis le serveur
        this.projectService.loadProjects();
      },
      error: (error) => {
        console.error('❌ Error updating project:', error);
        this.closeEditModal();
      }
    });
  }

  deleteProject(id: string) {
    if (confirm("Are you sure you want to delete this project?")) {
      this.projectService.deleteProject(id).subscribe({
        next: (response: any) => {
          if (response.success) {
            // Le service gère la suppression via les signaux
          } else {
            console.error('Delete failed:', response.message);
          }
        },
        error: (error) => {
          console.error('Error deleting project:', error);
        }
      });
    }
  }
}
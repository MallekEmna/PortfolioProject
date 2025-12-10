import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Project } from '../../../../core/models/project.model';
import { CommonModule } from '@angular/common';
import { ProjectCard } from '../project-card/project-card';

@Component({
  selector: 'app-projects-grid',
  standalone: true,
  imports: [CommonModule, ProjectCard],
  templateUrl: './projects-grid.html',
  styleUrls: ['./projects-grid.scss'],
})
export class ProjectsGrid {
  @Input() projects: Project[] = [];
  @Output() editProject = new EventEmitter<Project>();
  @Output() deleteProject = new EventEmitter<string>();
}


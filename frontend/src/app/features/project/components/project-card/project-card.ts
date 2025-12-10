import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Project } from '../../../../core/models/project.model';
import { LucideIconsModule } from '../../../../icons';
import { StatusColorPipe } from '../../../../shared/pipes/status-color.pipe';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { ImageFallbackPipe } from '../../../../shared/pipes/image-fallback.pipe';
import { TechListPipe } from '../../../../shared/pipes/tech-list.pipe';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, LucideIconsModule, StatusColorPipe, TruncatePipe, ImageFallbackPipe, TechListPipe],
  templateUrl: './project-card.html',
  styleUrls: ['./project-card.scss'],
})
export class ProjectCard {
  @Input() project!: Project;
  @Output() edit = new EventEmitter<Project>();
  @Output() delete = new EventEmitter<string>();
}

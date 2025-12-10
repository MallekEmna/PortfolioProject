import { Component, Input } from '@angular/core';
import { Project } from '../../../../core/models/project.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-projects-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-header.html',
  styleUrls: ['./projects-header.scss'],
})
export class ProjectsHeader {
  @Input() project!: Project | null;


}

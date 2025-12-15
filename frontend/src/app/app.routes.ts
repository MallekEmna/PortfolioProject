import { Routes } from '@angular/router';
import { Projects } from './features/project/components/projects/projects';
import { Profile } from './features/profile/components/profile/profile';
import { TemplatesPage } from './features/template/components/templates/templates';
import { TemplateEditor } from './features/template/components/template-editor/template-editor';
import { CvUploadComponent } from './features/cv-upload/cv-upload';
import { PortfolioViewerComponent } from './features/portfolio/components/portfolio-viewer/portfolio-viewer';

export const routes: Routes = [
    { path: 'profile', component: Profile },
    { path: 'projects', component: Projects },
    { path: 'templates', component: TemplatesPage },
    { path: 'templates/:id', component: TemplateEditor },
    { path: 'cv-upload', component: CvUploadComponent },
    { path: 'portfolio', component: PortfolioViewerComponent },
    { path: 'portfolio/:id', component: PortfolioViewerComponent },
    { path: '', redirectTo: 'profile', pathMatch: 'full' }

];

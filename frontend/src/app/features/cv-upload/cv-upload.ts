import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { CvParserService, ParsedCV } from '../../services/cv-parser.service';
import { UserService } from '../../services/user.service';
import { ProjectService } from '../../services/project.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './cv-upload.html',
  styleUrls: ['./cv-upload.scss'],
})
export class CvUploadComponent {
  form!: FormGroup;

  selectedFile: File | null = null;
  isLoading = false;
  errorMsg = '';
  successMsg = '';
  parsedData: ParsedCV | null = null;
  parsingMethod: 'local' | 'external' | 'ollama' = 'local'; // Méthode de parsing sélectionnée

  constructor(
    private fb: FormBuilder, 
    private cvService: CvParserService,
    private userService: UserService,
    private projectService: ProjectService
  ) {
    this.form = this.fb.group({
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      linkedin: [''],
      github: [''],
      title: ['', [Validators.required]],
      summary: [''],
      skillsTechnical: [''],
      skillsSoft: [''],
      experiences: this.fb.array([]),
      educations: this.fb.array([]),
      languages: this.fb.array([]),
      projects: this.fb.array([]),
    });
  }

  // Getters pour les FormArrays
  get experiences(): FormArray {
    return this.form.get('experiences') as FormArray;
  }

  get educations(): FormArray {
    return this.form.get('educations') as FormArray;
  }

  get languages(): FormArray {
    return this.form.get('languages') as FormArray;
  }

  get projects(): FormArray {
    return this.form.get('projects') as FormArray;
  }

  // Méthodes pour ajouter des entrées
  addExperience(): FormGroup {
    const experience = this.fb.group({
      company: [''],
      role: [''],
      start_date: [''],
      end_date: [''],
      description: [''],
      location: ['']
    });
    this.experiences.push(experience);
    return experience;
  }

  addEducation(): FormGroup {
    const education = this.fb.group({
      school: [''],
      degree: [''],
      field: [''],
      start_date: [''],
      end_date: [''],
      location: ['']
    });
    this.educations.push(education);
    return education;
  }

  addLanguage(): FormGroup {
    const language = this.fb.group({
      name: [''],
      level: ['']
    });
    this.languages.push(language);
    return language;
  }

  addProject(): FormGroup {
    const project = this.fb.group({
      title: [''],
      companyName: [''],
      description: [''],
      techStack: [''],
      duration: [''],
      category: [''],
      linkDemo: [''],
      linkGithub: ['']
    });
    this.projects.push(project);
    return project;
  }

  // Méthodes pour supprimer des entrées
  removeExperience(index: number): void {
    this.experiences.removeAt(index);
  }

  removeEducation(index: number): void {
    this.educations.removeAt(index);
  }

  removeLanguage(index: number): void {
    this.languages.removeAt(index);
  }

  removeProject(index: number): void {
    this.projects.removeAt(index);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        this.errorMsg = 'Please upload a PDF file.';
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        this.errorMsg = 'File is too large (max 8MB).';
        return;
      }
      this.errorMsg = '';
      this.selectedFile = file;
    }
  }

  submit() {
    if (!this.selectedFile) {
      this.errorMsg = 'Please select a PDF file.';
      this.successMsg = '';
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    // Choose method based on parsingMethod
    let parseObservable;
    switch (this.parsingMethod) {
      case 'external':
        parseObservable = this.cvService.parseCvExternal(this.selectedFile);
        break;
      case 'ollama':
        parseObservable = this.cvService.parseCvOllama(this.selectedFile);
        break;
      default:
        parseObservable = this.cvService.parseCv(this.selectedFile);
    }
    
    parseObservable.subscribe({
      next: (data) => {
        this.parsedData = data;
        this.patchForm(data);
        this.isLoading = false;
        const methodNames = {
          'local': 'Local',
          'external': 'External API',
          'ollama': 'Ollama LLM'
        };
        const method = methodNames[this.parsingMethod];
        this.successMsg = `CV parsed successfully using ${method}! Form has been auto-filled.`;
        
        // Log parsed data for debugging
        console.log(`Parsed CV data (${method}):`, data);
        console.log(`Found ${data.experience?.length || 0} experiences, ${data.education?.length || 0} education entries, ${data.languages?.length || 0} languages`);
      },
      error: (err) => {
        console.error('CV parsing error:', err);
        this.isLoading = false;
        this.successMsg = '';
        
        // Better error messages based on error type
        if (err.status === 0) {
          this.errorMsg = 'Cannot connect to the CV parser service. Please make sure the FastAPI server is running on http://localhost:8000';
        } else if (err.status === 400) {
          this.errorMsg = err.error?.detail || 'Invalid file format. Please upload a PDF file.';
        } else if (err.status === 413) {
          this.errorMsg = 'File is too large. Maximum size is 8MB.';
        } else if (err.status === 503) {
          this.errorMsg = err.error?.detail || 'Ollama service is not available. Please make sure Ollama is running.';
        } else if (err.status === 500 || err.status === 502 || err.status === 504) {
          this.errorMsg = err.error?.detail || 'The CV parsing service encountered an error. Please try again later.';
        } else {
          this.errorMsg = err.error?.detail || 'Failed to parse CV. Please try again.';
        }
      },
    });
  }

  patchForm(data: ParsedCV) {
    // Mettre à jour les champs de base
    this.form.patchValue({
      full_name: data.personal.full_name ?? '',
      email: data.personal.email ?? '',
      phone: data.personal.phone ?? '',
      address: data.personal.address ?? '',
      linkedin: data.personal.linkedin ?? '',
      github: data.personal.github ?? '',
      title: data.profile.title ?? '',
      summary: data.profile.summary ?? '',
      skillsTechnical: (data.skills.technical || []).join(', '),
      skillsSoft: (data.skills.soft || []).join(', '),
    });

    // Vider les FormArrays existants
    while (this.experiences.length !== 0) {
      this.experiences.removeAt(0);
    }
    while (this.educations.length !== 0) {
      this.educations.removeAt(0);
    }
    while (this.languages.length !== 0) {
      this.languages.removeAt(0);
    }
    while (this.projects.length !== 0) {
      this.projects.removeAt(0);
    }

    // Ajouter les expériences
    if (data.experience && data.experience.length > 0) {
      data.experience.forEach(exp => {
        const expGroup = this.addExperience();
        expGroup.patchValue({
          company: exp.company ?? '',
          role: exp.role ?? '',
          start_date: exp.start_date ?? '',
          end_date: exp.end_date ?? '',
          description: exp.description ?? '',
          location: exp.location ?? ''
        });
      });
    }

    // Ajouter les formations
    if (data.education && data.education.length > 0) {
      data.education.forEach(edu => {
        const eduGroup = this.addEducation();
        eduGroup.patchValue({
          school: edu.school ?? '',
          degree: edu.degree ?? '',
          field: edu.field ?? '',
          start_date: edu.start_date ?? '',
          end_date: edu.end_date ?? '',
          location: edu.location ?? ''
        });
      });
    }

    // Ajouter les langues
    if (data.languages && data.languages.length > 0) {
      data.languages.forEach(lang => {
        const langGroup = this.addLanguage();
        langGroup.patchValue({
          name: lang.name ?? '',
          level: lang.level ?? ''
        });
      });
    }

    // Convertir les expériences en projets si elles contiennent des descriptions de projets
    // (Optionnel: vous pouvez aussi extraire les projets directement du CV si présents)
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMsg = 'Please fill in all required fields correctly.';
      this.successMsg = '';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    this.successMsg = '';

    const formValue = this.form.value;
    
    // Préparer les données pour la mise à jour du profil
    const userUpdateData: any = {
      username: formValue.full_name || '',
      bio: formValue.summary || '',
      phone: formValue.phone || '',
      location: formValue.address || '',
      skills: [
        ...(formValue.skillsTechnical ? formValue.skillsTechnical.split(',').map((s: string) => s.trim()).filter((s: string) => s) : []),
        ...(formValue.skillsSoft ? formValue.skillsSoft.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [])
      ]
    };

    // Préparer les données pour les social links
    const socialLinksData: any = {};
    if (formValue.linkedin) {
      socialLinksData.linkedin = formValue.linkedin;
    }
    if (formValue.github) {
      socialLinksData.github = formValue.github;
    }

    // Mettre à jour le profil utilisateur et les social links en parallèle
    const updateUser$ = this.userService.updateUserProfile(userUpdateData).pipe(
      catchError(error => {
        console.error('Error updating user profile:', error);
        throw error;
      })
    );
    
    const updateSocialLinks$ = Object.keys(socialLinksData).length > 0 
      ? this.userService.updateSocialLinks(socialLinksData).pipe(
          catchError(error => {
            console.error('Error updating social links:', error);
            // Ne pas bloquer si les social links échouent
            return of(null);
          })
        )
      : of(null);

    // Sauvegarder les projets si présents
    const projectsToSave = this.projects.value.filter((p: any) => p.title && p.title.trim() !== '');
    const saveProjects$ = projectsToSave.length > 0
      ? forkJoin(
          projectsToSave.map((project: any) => {
            const projectData = {
              title: project.title,
              companyName: project.companyName || 'Personal Project',
              description: project.description || '',
              techStack: project.techStack ? project.techStack.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [],
              duration: project.duration || '',
              category: project.category || 'Other',
              linkDemo: project.linkDemo || '',
              linkGithub: project.linkGithub || '',
              status: 'Complete' as const
            };
            return this.projectService.createProject(projectData).pipe(
              catchError(error => {
                console.error('Error creating project:', error);
                return of(null);
              })
            );
          })
        )
      : of([]);

    forkJoin([updateUser$, updateSocialLinks$, saveProjects$]).subscribe({
      next: ([userResponse, socialResponse, projectsResponse]) => {
        this.isLoading = false;
        let successMessages = ['Profile updated successfully!'];
        
        if (projectsToSave.length > 0) {
          const savedCount = projectsResponse.filter((p: any) => p !== null).length;
          successMessages.push(`${savedCount} project(s) created successfully!`);
        }
        
        this.successMsg = successMessages.join(' ');
        this.errorMsg = '';
        console.log('Profile updated:', userResponse);
        console.log('Social links updated:', socialResponse);
        console.log('Projects created:', projectsResponse);
        
        // Recharger le profil utilisateur pour avoir les données à jour
        this.userService.loadUserProfile();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMsg = error.error?.msg || error.error?.message || 'Failed to update profile. Please try again.';
        this.successMsg = '';
        console.error('Error updating profile:', error);
      }
    });
  }

  get f() {
    return this.form.controls;
  }
}


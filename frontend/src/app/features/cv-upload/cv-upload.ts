import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CvParserService, ParsedCV } from '../../services/cv-parser.service';

@Component({
  selector: 'app-cv-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cv-upload.html',
  styleUrls: ['./cv-upload.scss'],
})
export class CvUploadComponent {
  form!: FormGroup;

  selectedFile: File | null = null;
  isLoading = false;
  errorMsg = '';
  parsedData: ParsedCV | null = null;

  constructor(private fb: FormBuilder, private cvService: CvParserService) {
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
    });
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
      return;
    }
    this.isLoading = true;
    this.errorMsg = '';
    this.cvService.parseCv(this.selectedFile).subscribe({
      next: (data) => {
        this.parsedData = data;
        this.patchForm(data);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Failed to parse CV. Please try again.';
        this.isLoading = false;
      },
    });
  }

  patchForm(data: ParsedCV) {
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
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // TODO: integrate with backend profile update if needed.
    console.log('Form saved', this.form.value);
  }

  get f() {
    return this.form.controls;
  }
}


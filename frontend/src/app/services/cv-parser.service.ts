import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interfaces aligning with fastapi CV schema
export interface ParsedCV {
  personal: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    linkedin: string | null;
    github: string | null;
  };
  profile: {
    title: string | null;
    summary: string | null;
  };
  skills: {
    technical: string[];
    soft: string[];
  };
  experience: Array<{
    company: string | null;
    role: string | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
    location: string | null;
  }>;
  education: Array<{
    school: string | null;
    degree: string | null;
    field: string | null;
    start_date: string | null;
    end_date: string | null;
    location: string | null;
  }>;
  languages: Array<{
    name: string | null;
    level: string | null;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class CvParserService {
  private apiBase = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  parseCv(file: File): Observable<ParsedCV> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ParsedCV>(`${this.apiBase}/parse-cv`, formData, {
      headers: { },
    });
  }
}


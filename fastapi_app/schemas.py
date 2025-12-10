from typing import List, Optional
from pydantic import BaseModel


class Personal(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


class Profile(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None


class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None


class EducationItem(BaseModel):
    school: Optional[str] = None
    degree: Optional[str] = None
    field: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None


class LanguageItem(BaseModel):
    name: Optional[str] = None
    level: Optional[str] = None


class Skills(BaseModel):
    technical: List[str] = []
    soft: List[str] = []


class CVSchema(BaseModel):
    personal: Personal
    profile: Profile
    skills: Skills
    experience: List[ExperienceItem]
    education: List[EducationItem]
    languages: List[LanguageItem]

    class Config:
        schema_extra = {
            "example": {
                "personal": {
                    "full_name": "Jane Doe",
                    "email": "jane@example.com",
                    "phone": "+33 6 12 34 56 78",
                    "address": "Paris, France",
                    "linkedin": "https://linkedin.com/in/janedoe",
                    "github": "https://github.com/janedoe"
                },
                "profile": {
                    "title": "Software Engineer",
                    "summary": "Backend engineer with experience in Python and FastAPI."
                },
                "skills": {
                    "technical": ["Python", "FastAPI", "Docker"],
                    "soft": ["Communication", "Teamwork"]
                },
                "experience": [
                    {
                        "company": "ACME Corp",
                        "role": "Backend Engineer",
                        "start_date": "2021-01",
                        "end_date": "2023-06",
                        "description": "Built APIs with FastAPI.",
                        "location": "Remote"
                    }
                ],
                "education": [
                    {
                        "school": "University X",
                        "degree": "MSc Computer Science",
                        "field": "Computer Science",
                        "start_date": "2018",
                        "end_date": "2020",
                        "location": "Paris"
                    }
                ],
                "languages": [
                    {
                        "name": "French",
                        "level": "Native"
                    },
                    {
                        "name": "English",
                        "level": "Fluent"
                    }
                ]
            }
        }
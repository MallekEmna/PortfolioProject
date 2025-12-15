import json
import logging
import os
import re
import io
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import pdfplumber
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from schemas import CVSchema, Personal, Profile, ExperienceItem, EducationItem, LanguageItem, Skills

# Load environment variables from .env file
load_dotenv()

# Basic logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi-cv-parser")

app = FastAPI(
    title="fastapi-cv-parser",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration des APIs externes
EXTRACTA_API_KEY = os.getenv("EXTRACTA_API_KEY")
EXTRACTA_URL = os.getenv("EXTRACTA_URL", "https://api.extracta.ai/v1/extractions")

# DocParserAI - 1000 pages gratuites
DOCPARSERAI_API_KEY = os.getenv("DOCPARSERAI_API_KEY")
DOCPARSERAI_URL = os.getenv("DOCPARSERAI_URL", "https://api.docparserai.com/v1/extract")

# Nanonets - Document Extraction API
NANONETS_API_KEY = os.getenv("NANONETS_API_KEY")
NANONETS_BASE_URL = "https://extraction-api.nanonets.com/api/v1"

# HrFlow.ai - API gratuite
HRFLOW_API_KEY = os.getenv("HRFLOW_API_KEY")
HRFLOW_URL = os.getenv("HRFLOW_URL", "https://api.hrflow.ai/v1/documents/parsing")

# Google Cloud Document AI (nécessite compte Google Cloud)
GOOGLE_CLOUD_PROJECT_ID = os.getenv("GOOGLE_CLOUD_PROJECT_ID")
GOOGLE_CLOUD_LOCATION = os.getenv("GOOGLE_CLOUD_LOCATION", "us")
GOOGLE_CLOUD_PROCESSOR_ID = os.getenv("GOOGLE_CLOUD_PROCESSOR_ID")

# Utiliser l'extraction locale si les APIs ne sont pas disponibles
USE_LOCAL_EXTRACTION = os.getenv("USE_LOCAL_EXTRACTION", "true").lower() == "true"
MAX_FILE_SIZE = 8 * 1024 * 1024  # 8MB

# Configuration Ollama
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")  # Modèle par défaut


def call_extracta_api(file_data: bytes, filename: str) -> dict:
    """
    Call Extracta API to parse CV
    """
    if not EXTRACTA_API_KEY:
        raise ValueError("EXTRACTA_API_KEY is not set in environment variables")
    
    files = {
        "file": (filename, file_data, "application/pdf")
    }

    extraction_details = {
        "name": "Resume Extraction",
        "language": "English",
        "fields": [
            {
                "key": "personal",
                "type": "object",
                "properties": [
                    {"key": "full_name", "type": "string"},
                    {"key": "email", "type": "string"},
                    {"key": "phone", "type": "string"},
                    {"key": "address", "type": "string"},
                    {"key": "linkedin", "type": "string"},
                    {"key": "github", "type": "string"}
                ]
            },
            {
                "key": "profile",
                "type": "object",
                "properties": [
                    {"key": "title", "type": "string"},
                    {"key": "summary", "type": "string"},
                    {"key": "objective", "type": "string"}
                ]
            },
            {
                "key": "experience",
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": [
                        {"key": "company", "type": "string"},
                        {"key": "role", "type": "string"},
                        {"key": "position", "type": "string"},
                        {"key": "title", "type": "string"},
                        {"key": "start_date", "type": "string"},
                        {"key": "start", "type": "string"},
                        {"key": "end_date", "type": "string"},
                        {"key": "end", "type": "string"},
                        {"key": "description", "type": "string"},
                        {"key": "location", "type": "string"}
                    ]
                }
            },
            {
                "key": "education",
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": [
                        {"key": "school", "type": "string"},
                        {"key": "institution", "type": "string"},
                        {"key": "university", "type": "string"},
                        {"key": "degree", "type": "string"},
                        {"key": "field", "type": "string"},
                        {"key": "major", "type": "string"},
                        {"key": "start_date", "type": "string"},
                        {"key": "start", "type": "string"},
                        {"key": "end_date", "type": "string"},
                        {"key": "end", "type": "string"},
                        {"key": "location", "type": "string"}
                    ]
                }
            },
            {
                "key": "skills",
                "type": "array",
                "items": {"type": "string"}
            },
            {
                "key": "languages",
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": [
                        {"key": "name", "type": "string"},
                        {"key": "language", "type": "string"},
                        {"key": "level", "type": "string"},
                        {"key": "proficiency", "type": "string"}
                    ]
                }
            }
        ]
    }

    headers = {
        "Authorization": f"Bearer {EXTRACTA_API_KEY}",
        "Accept": "application/json"
    }

    # Essayer différentes méthodes d'appel selon la documentation Extracta
    # Méthode 1: Avec extractionDetails en JSON
    try:
    response = requests.post(
        EXTRACTA_URL,
        headers=headers,
        files=files,
        data={
                "extractionDetails": json.dumps(extraction_details)
            },
            timeout=60  # Augmenter le timeout car l'extraction peut prendre du temps
        )
        
        if response.status_code == 200:
            return response.json()
        elif response.status_code == 404:
            # Essayer avec une URL alternative
            logger.warning(f"URL {EXTRACTA_URL} returned 404, trying alternative endpoints...")
            alternative_urls = [
                "https://api.extracta.ai/v1/createExtraction",
                "https://api.extracta.ai/extractions",
                "https://extracta.ai/api/v1/extractions"
            ]
            
            for alt_url in alternative_urls:
                logger.info(f"Trying alternative URL: {alt_url}")
                try:
                    response = requests.post(
                        alt_url,
                        headers=headers,
                        files=files,
                        data={
                            "extractionDetails": json.dumps(extraction_details)
                        },
                        timeout=60
                    )
                    if response.status_code == 200:
                        logger.info(f"Success with URL: {alt_url}")
                        return response.json()
                except Exception as e:
                    logger.warning(f"Failed with {alt_url}: {str(e)}")
                    continue
            
            # Si toutes les URLs échouent, lever une erreur avec des instructions
            error_msg = (
                f"Extracta API endpoint not found (404). "
                f"Tried: {EXTRACTA_URL} and alternatives. "
                f"Please check:\n"
                f"1. Your EXTRACTA_API_KEY is correct\n"
                f"2. The Extracta API endpoint URL in the documentation\n"
                f"3. Set EXTRACTA_URL in .env file with the correct endpoint\n"
                f"Response: {response.text[:500]}"
            )
            logger.error(error_msg)
            raise RuntimeError(error_msg)
        else:
            error_msg = f"Extracta API failed: {response.status_code} - {response.text[:500]}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request exception: {str(e)}")
        raise RuntimeError(f"Failed to connect to Extracta API: {str(e)}")


def call_docparserai_api(file_data: bytes, filename: str) -> dict:
    """
    Call DocParserAI API to parse CV
    Free: 1000 pages/month
    Documentation: https://docparserai.com
    """
    if not DOCPARSERAI_API_KEY:
        raise ValueError("DOCPARSERAI_API_KEY is not set in environment variables")
    
    files = {
        "file": (filename, file_data, "application/pdf")
    }
    
    headers = {
        "Authorization": f"Bearer {DOCPARSERAI_API_KEY}",
        "Accept": "application/json"
    }
    
    # DocParserAI endpoint for resume extraction
    data = {
        "document_type": "resume",
        "language": "en"
    }
    
    try:
        response = requests.post(
            DOCPARSERAI_URL,
            headers=headers,
            files=files,
            data=data,
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            error_msg = f"DocParserAI API failed: {response.status_code} - {response.text[:500]}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
            
    except requests.exceptions.RequestException as e:
        logger.error(f"DocParserAI request exception: {str(e)}")
        raise RuntimeError(f"Failed to connect to DocParserAI API: {str(e)}")


def call_nanonets_api(file_data: bytes, filename: str, output_format: str = "json") -> dict:
    """
    Call Nanonets Document Extraction API to parse CV
    Documentation: https://docstrange.nanonets.com
    
    Args:
        file_data: PDF file bytes
        filename: PDF filename
        output_format: Output format (markdown, html, json, csv). Default: json
    
    Returns:
        Parsed CV data as dict
    """
    if not NANONETS_API_KEY:
        raise ValueError("NANONETS_API_KEY is not set in environment variables")
    
    files = {
        "file": (filename, file_data, "application/pdf")
    }
    
    headers = {
        "Authorization": f"Bearer {NANONETS_API_KEY}",
        "Accept": "application/json"
    }
    
    # Nanonets synchronous extraction endpoint
    data = {
        "output_format": output_format
    }
    
    # Optional: Add custom instructions for CV extraction
    custom_instructions = (
        "Extract CV information including: personal details (name, email, phone, address, linkedin, github), "
        "profile (title, summary), skills (technical and soft skills), work experience (company, role, dates, description, location), "
        "education (school, degree, field, dates, location), and languages (name, level). "
        "Format dates as YYYY-MM or YYYY. Return structured JSON."
    )
    data["custom_instructions"] = custom_instructions
    
    try:
        logger.info(f"Calling Nanonets API with output format: {output_format}")
        response = requests.post(
            f"{NANONETS_BASE_URL}/extract/sync",
            headers=headers,
            files=files,
            data=data,
            timeout=120  # Nanonets can take longer for complex documents
        )
        
        if response.status_code == 200:
            result = response.json()
            logger.info("Nanonets API extraction successful")
            return result
        else:
            error_msg = f"Nanonets API failed: {response.status_code} - {response.text[:500]}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Nanonets request exception: {str(e)}")
        raise RuntimeError(f"Failed to connect to Nanonets API: {str(e)}")


def call_hrflow_api(file_data: bytes, filename: str) -> dict:
    """
    Call HrFlow.ai API to parse CV
    Free tier available
    Documentation: https://hrflow.ai
    """
    if not HRFLOW_API_KEY:
        raise ValueError("HRFLOW_API_KEY is not set in environment variables")
    
    files = {
        "file": (filename, file_data, "application/pdf")
    }
    
    headers = {
        "X-API-KEY": HRFLOW_API_KEY,
        "Accept": "application/json"
    }
    
    data = {
        "format": "json",
        "language": "en"
    }
    
    try:
        response = requests.post(
            HRFLOW_URL,
            headers=headers,
            files=files,
            data=data,
            timeout=60
        )
        
        if response.status_code == 200:
    return response.json()
        else:
            error_msg = f"HrFlow API failed: {response.status_code} - {response.text[:500]}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
            
    except requests.exceptions.RequestException as e:
        logger.error(f"HrFlow request exception: {str(e)}")
        raise RuntimeError(f"Failed to connect to HrFlow API: {str(e)}")


def call_external_api(file_data: bytes, filename: str, api_name: str = "auto") -> dict:
    """
    Call external API to parse CV. Tries multiple APIs in order of preference.
    
    Args:
        file_data: PDF file bytes
        filename: PDF filename
        api_name: API to use ("auto", "extracta", "docparserai", "hrflow")
    
    Returns:
        Parsed CV data as dict
    """
    if api_name == "auto":
        # Try APIs in order of preference
        apis_to_try = []
        
        if DOCPARSERAI_API_KEY:
            apis_to_try.append(("docparserai", call_docparserai_api))
        if NANONETS_API_KEY:
            apis_to_try.append(("nanonets", lambda f, n: call_nanonets_api(f, n, "json")))
        if HRFLOW_API_KEY:
            apis_to_try.append(("hrflow", call_hrflow_api))
        if EXTRACTA_API_KEY:
            apis_to_try.append(("extracta", call_extracta_api))
        
        if not apis_to_try:
            raise ValueError(
                "No external API configured. Please set at least one API key in .env file:\n"
                "- DOCPARSERAI_API_KEY (1000 pages free/month)\n"
                "- NANONETS_API_KEY (AI-powered extraction)\n"
                "- HRFLOW_API_KEY (free tier available)\n"
                "- EXTRACTA_API_KEY\n"
                "Or use /parse-cv endpoint for local extraction."
            )
        
        # Try each API until one succeeds
        last_error = None
        for api_name, api_func in apis_to_try:
            try:
                logger.info(f"Trying {api_name} API...")
                result = api_func(file_data, filename)
                logger.info(f"Successfully parsed with {api_name} API")
                return result
            except Exception as e:
                logger.warning(f"{api_name} API failed: {str(e)}")
                last_error = e
                continue
        
        # All APIs failed
        raise RuntimeError(
            f"All external APIs failed. Last error: {str(last_error)}\n"
            "Please check your API keys or use /parse-cv endpoint for local extraction."
        )
    
    elif api_name == "docparserai":
        return call_docparserai_api(file_data, filename)
    elif api_name == "nanonets":
        return call_nanonets_api(file_data, filename, "json")
    elif api_name == "hrflow":
        return call_hrflow_api(file_data, filename)
    elif api_name == "extracta":
        return call_extracta_api(file_data, filename)
    else:
        raise ValueError(f"Unknown API name: {api_name}. Use 'auto', 'docparserai', 'nanonets', 'hrflow', or 'extracta'")


def extract_text_from_pdf(file_data: bytes) -> str:
    """
    Extrait tout le texte d'un PDF en utilisant pdfplumber.
    
    Args:
        file_data: Données binaires du fichier PDF
        
    Returns:
        Texte complet extrait du PDF
    """
    try:
        pdf_file = io.BytesIO(file_data)
        full_text = ""
        
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"
        
        if not full_text:
            raise ValueError("Impossible d'extraire le texte du PDF")
        
        logger.info(f"Texte extrait: {len(full_text)} caractères")
        return full_text
        
    except Exception as e:
        logger.error(f"Erreur lors de l'extraction du texte: {str(e)}")
        raise ValueError(f"Erreur lors de l'extraction du texte du PDF: {str(e)}")


def call_ollama_api(prompt: str, model: str = None) -> str:
    """
    Appelle l'API Ollama pour générer une réponse à partir d'un prompt.
    
    Args:
        prompt: Le prompt à envoyer au modèle
        model: Le nom du modèle Ollama à utiliser (par défaut: OLLAMA_MODEL)
        
    Returns:
        La réponse générée par le modèle
    """
    if model is None:
        model = OLLAMA_MODEL
    
    url = f"{OLLAMA_BASE_URL}/api/generate"
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": False,
        "format": "json"  # Forcer le format JSON
    }
    
    try:
        logger.info(f"Appel à Ollama avec le modèle: {model}")
        response = requests.post(url, json=payload, timeout=300)  # Timeout de 5 minutes pour les gros PDFs
        
        if response.status_code == 200:
            result = response.json()
            return result.get("response", "")
        else:
            error_msg = f"Ollama API failed: {response.status_code} - {response.text[:500]}"
            logger.error(error_msg)
            raise RuntimeError(error_msg)
            
    except requests.exceptions.ConnectionError:
        raise RuntimeError(
            f"Impossible de se connecter à Ollama à {OLLAMA_BASE_URL}. "
            "Assurez-vous qu'Ollama est démarré et accessible."
        )
    except requests.exceptions.Timeout:
        raise RuntimeError(
            "Timeout lors de l'appel à Ollama. Le modèle prend trop de temps à répondre.\n"
            "Suggestions:\n"
            "1. Utilisez un modèle plus rapide (ex: llama3.2:1b)\n"
            "2. Réduisez la taille du PDF\n"
            "3. Vérifiez que votre machine a assez de RAM\n"
            "4. Utilisez /parse-cv pour l'extraction locale (plus rapide)"
        )
    except Exception as e:
        logger.error(f"Erreur lors de l'appel à Ollama: {str(e)}")
        raise RuntimeError(f"Erreur lors de l'appel à Ollama: {str(e)}")


def parse_cv_with_ollama(pdf_text: str) -> dict:
    """
    Utilise Ollama pour extraire les informations d'un CV à partir du texte extrait.
    
    Args:
        pdf_text: Texte complet extrait du PDF
        
    Returns:
        Dictionnaire contenant les informations structurées du CV
    """
    # Créer le prompt pour Ollama
    schema_example = json.dumps({
        "personal": {
            "full_name": "string",
            "email": "string",
            "phone": "string",
            "address": "string",
            "linkedin": "string",
            "github": "string"
        },
        "profile": {
            "title": "string",
            "summary": "string"
        },
        "skills": {
            "technical": ["string"],
            "soft": ["string"]
        },
        "experience": [
            {
                "company": "string",
                "role": "string",
                "start_date": "string",
                "end_date": "string",
                "description": "string",
                "location": "string"
            }
        ],
        "education": [
            {
                "school": "string",
                "degree": "string",
                "field": "string",
                "start_date": "string",
                "end_date": "string",
                "location": "string"
            }
        ],
        "languages": [
            {
                "name": "string",
                "level": "string"
            }
        ]
    }, indent=2)
    
    # Limiter le texte à 6000 caractères pour éviter les timeouts
    # Prendre le début et la fin du texte pour avoir le maximum d'infos
    text_length = len(pdf_text)
    if text_length > 6000:
        # Prendre les premiers 4000 caractères (header, expérience) et les derniers 2000 (formations, compétences)
        truncated_text = pdf_text[:4000] + "\n\n[... texte tronqué ...]\n\n" + pdf_text[-2000:]
    else:
        truncated_text = pdf_text
    
    prompt = f"""Tu es un expert en extraction d'informations de CV. Analyse le CV suivant et extrais TOUTES les informations de manière précise et complète.

Retourne UNIQUEMENT un JSON valide avec cette structure exacte:

{schema_example}

INSTRUCTIONS DÉTAILLÉES:
1. PERSONAL:
   - full_name: Nom complet (prénom + nom de famille)
   - email: Email complet si présent
   - phone: Numéro de téléphone avec indicatif si présent
   - address: Adresse complète
   - linkedin: URL LinkedIn complète (commence par https://)
   - github: URL GitHub complète (commence par https://)

2. PROFILE:
   - title: Titre professionnel (ex: "Développeur Full Stack", "Data Scientist")
   - summary: Résumé professionnel ou objectif de carrière (2-3 phrases)

3. SKILLS:
   - technical: Liste de toutes les compétences techniques (langages, frameworks, outils)
   - soft: Liste des compétences douces (communication, leadership, etc.)

4. EXPERIENCE:
   - Extrait TOUTES les expériences professionnelles
   - company: Nom complet de l'entreprise
   - role: Titre du poste exact
   - start_date: Date de début (format YYYY-MM ou YYYY)
   - end_date: Date de fin ou "Present" si en cours (format YYYY-MM ou YYYY)
   - description: Description détaillée des responsabilités et réalisations (plusieurs phrases)
   - location: Lieu de travail (ville, pays)

5. EDUCATION:
   - Extrait TOUTES les formations
   - school: Nom complet de l'établissement
   - degree: Diplôme obtenu (ex: "Master", "Licence", "Ingénieur")
   - field: Domaine d'étude (ex: "Informatique", "Génie Logiciel")
   - start_date: Date de début (format YYYY-MM ou YYYY)
   - end_date: Date de fin ou "Present" si en cours (format YYYY-MM ou YYYY)
   - location: Lieu de l'établissement

6. LANGUAGES:
   - Extrait TOUTES les langues avec leur niveau (A1, A2, B1, B2, C1, C2, Native)

RÈGLES IMPORTANTES:
- Retourne UNIQUEMENT du JSON valide, sans texte avant ou après
- Utilise null pour les champs manquants (pas de chaînes vides pour null)
- Pour les dates, utilise YYYY-MM si le mois est connu, sinon YYYY
- Extrait les descriptions complètes, pas juste des mots-clés
- Sois précis dans l'extraction des noms d'entreprises et d'établissements
- Si une information n'est pas claire, utilise null plutôt qu'une valeur incorrecte

CV:
{truncated_text}

Retourne uniquement le JSON, sans explication ni texte supplémentaire:"""

    try:
        logger.info("Appel à Ollama pour extraire les informations du CV...")
        response_text = call_ollama_api(prompt)
        
        # Nettoyer la réponse pour extraire uniquement le JSON
        # Parfois Ollama ajoute du texte avant/après le JSON
        response_text = response_text.strip()
        
        # Chercher le JSON dans la réponse
        json_start = response_text.find('{')
        json_end = response_text.rfind('}') + 1
        
        if json_start != -1 and json_end > json_start:
            json_str = response_text[json_start:json_end]
            cv_data = json.loads(json_str)
            logger.info("CV parsé avec succès via Ollama")
            return cv_data
        else:
            raise ValueError("Aucun JSON valide trouvé dans la réponse d'Ollama")
            
    except json.JSONDecodeError as e:
        logger.error(f"Erreur de parsing JSON: {str(e)}")
        logger.error(f"Réponse d'Ollama: {response_text[:500]}")
        raise ValueError(f"Impossible de parser la réponse JSON d'Ollama: {str(e)}")
    except Exception as e:
        logger.error(f"Erreur lors du parsing avec Ollama: {str(e)}")
        raise


def parse_pdf_locally(file_data: bytes) -> dict:
    """
    Parse PDF locally using pdfplumber and extract CV information using regex patterns.
    This is a fallback when Extracta API is not available.
    """
    try:
        # Extract text from PDF
        pdf_file = io.BytesIO(file_data)
        full_text = ""
        
        with pdfplumber.open(pdf_file) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"
        
        if not full_text:
            raise ValueError("Could not extract text from PDF")
        
        logger.info(f"Extracted {len(full_text)} characters from PDF")
        
        # Extract information using regex patterns
        result = {
            "personal": {},
            "profile": {},
            "experience": [],
            "education": [],
            "skills": [],
            "languages": []
        }
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        emails = re.findall(email_pattern, full_text)
        if emails:
            result["personal"]["email"] = emails[0]
        
        # Phone pattern (international and local formats)
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
        phones = re.findall(phone_pattern, full_text)
        if phones:
            # Take the first phone number that looks complete
            for match in re.finditer(phone_pattern, full_text):
                phone = match.group(0).strip()
                if len(phone.replace(' ', '').replace('-', '').replace('.', '').replace('(', '').replace(')', '')) >= 8:
                    result["personal"]["phone"] = phone
                    break
        
        # LinkedIn pattern
        linkedin_pattern = r'(?:linkedin\.com/in/|linkedin\.com/pub/)([a-zA-Z0-9-]+)'
        linkedin_match = re.search(linkedin_pattern, full_text, re.IGNORECASE)
        if linkedin_match:
            result["personal"]["linkedin"] = f"https://linkedin.com/in/{linkedin_match.group(1)}"
        
        # GitHub pattern
        github_pattern = r'(?:github\.com/)([a-zA-Z0-9-]+)'
        github_match = re.search(github_pattern, full_text, re.IGNORECASE)
        if github_match:
            result["personal"]["github"] = f"https://github.com/{github_match.group(1)}"
        
        # Name - usually at the beginning, first line or two
        lines = full_text.split('\n')[:10]  # Check first 10 lines
        for line in lines:
            line = line.strip()
            if line and len(line) > 3 and len(line) < 50:
                # Check if it looks like a name (not email, not phone, not URL)
                if not re.search(email_pattern, line) and not re.search(phone_pattern, line) and not re.search(r'http', line, re.IGNORECASE):
                    if not result["personal"].get("full_name"):
                        result["personal"]["full_name"] = line
                        break
        
        # Skills - common technical skills keywords
        skills_keywords = [
            'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
            'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring',
            'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
            'Git', 'Linux', 'Windows', 'HTML', 'CSS', 'SASS', 'Bootstrap', 'Tailwind',
            'Machine Learning', 'AI', 'TensorFlow', 'PyTorch', 'Data Science', 'Analytics'
        ]
        
        found_skills = []
        text_lower = full_text.lower()
        for skill in skills_keywords:
            if skill.lower() in text_lower:
                found_skills.append(skill)
        
        result["skills"] = found_skills[:20]  # Limit to 20 skills
        
        # Experience - look for common patterns
        experience_keywords = ['experience', 'work experience', 'employment', 'career', 'professional experience']
        experience_section = ""
        for keyword in experience_keywords:
            pattern = rf'{keyword}.*?(?=(?:education|skills|projects|$))'
            match = re.search(pattern, full_text, re.IGNORECASE | re.DOTALL)
            if match:
                experience_section = match.group(0)
                break
        
        # Try to extract company names and roles (basic pattern)
        if experience_section:
            # Look for patterns like "Company Name - Role" or "Role at Company"
            company_role_pattern = r'([A-Z][a-zA-Z\s&]+(?:Inc|LLC|Ltd|Corp)?)\s*[-–—]\s*([A-Z][a-zA-Z\s]+)'
            matches = re.finditer(company_role_pattern, experience_section)
            for match in matches:
                company = match.group(1).strip()
                role = match.group(2).strip()
                if len(company) > 2 and len(role) > 2:
                    result["experience"].append({
                        "company": company,
                        "role": role
                    })
        
        # Education - look for education section
        education_keywords = ['education', 'academic', 'university', 'degree', 'diploma']
        education_section = ""
        for keyword in education_keywords:
            pattern = rf'{keyword}.*?(?=(?:experience|skills|projects|$))'
            match = re.search(pattern, full_text, re.IGNORECASE | re.DOTALL)
            if match:
                education_section = match.group(0)
                break
        
        # Extract degree and school names
        if education_section:
            degree_pattern = r'(Bachelor|Master|PhD|Doctorate|Diploma|Certificate)\s+(?:of|in)?\s*([A-Z][a-zA-Z\s]+)'
            matches = re.finditer(degree_pattern, education_section, re.IGNORECASE)
            for match in matches:
                degree = f"{match.group(1)} {match.group(2)}"
                result["education"].append({
                    "degree": degree.strip()
                })
        
        # Profile/Summary - usually near the beginning after name
        summary_keywords = ['summary', 'profile', 'about', 'objective', 'overview']
        for keyword in summary_keywords:
            pattern = rf'{keyword}.*?(?=(?:experience|education|skills|$))'
            match = re.search(pattern, full_text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(0).replace(keyword, '', 1).strip()
                # Clean up summary
                summary = re.sub(r'\s+', ' ', summary)
                if len(summary) > 20 and len(summary) < 500:
                    result["profile"]["summary"] = summary[:500]
                    break
        
        # Title - often near the name or in summary
        title_keywords = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant', 'specialist']
        for line in lines[:5]:
            for keyword in title_keywords:
                if keyword.lower() in line.lower():
                    result["profile"]["title"] = line.strip()
                    break
            if result["profile"].get("title"):
                break
        
        logger.info(f"Local extraction completed. Found: {len(result['experience'])} experiences, {len(result['education'])} education entries, {len(result['skills'])} skills")
        
        return result
        
    except Exception as e:
        logger.error(f"Error in local PDF parsing: {str(e)}", exc_info=True)
        raise RuntimeError(f"Failed to parse PDF locally: {str(e)}")


def transform_extracta_response(extracta_response: dict) -> CVSchema:
    """
    Transform Extracta API response or local extraction result to CVSchema format.
    Extracta typically returns data in an 'extraction' key with nested fields.
    Local extraction returns a flat structure.
    """
    try:
        # Extract the actual data from Extracta response
        # Extracta may return: {"extraction": {...}} or {"data": {...}} or directly the fields
        # Local extraction returns the data directly
        extraction_data = extracta_response.get("extraction", extracta_response.get("data", extracta_response))
        
        # If extraction_data is still a dict with nested structure, try to get the actual fields
        if isinstance(extraction_data, dict) and "extraction" in extraction_data:
            extraction_data = extraction_data["extraction"]
        
        # Transform personal information
        personal_data = extraction_data.get("personal", {})
        personal = Personal(
            full_name=personal_data.get("full_name"),
            email=personal_data.get("email"),
            phone=personal_data.get("phone"),
            address=personal_data.get("address"),
            linkedin=personal_data.get("linkedin"),
            github=personal_data.get("github")
        )
        
        # Transform profile (title and summary)
        # Extracta might return these in different places
        profile_data = extraction_data.get("profile", {})
        profile = Profile(
            title=profile_data.get("title") or extraction_data.get("title"),
            summary=profile_data.get("summary") or extraction_data.get("summary") or extraction_data.get("objective")
        )
        
        # Transform experience
        experience_list = extraction_data.get("experience", [])
        if not isinstance(experience_list, list):
            experience_list = []
        
        experience = [
            ExperienceItem(
                company=exp.get("company"),
                role=exp.get("role") or exp.get("position") or exp.get("title"),
                start_date=exp.get("start_date") or exp.get("start"),
                end_date=exp.get("end_date") or exp.get("end"),
                description=exp.get("description"),
                location=exp.get("location")
            )
            for exp in experience_list
            if isinstance(exp, dict)
        ]
        
        # Transform education
        education_list = extraction_data.get("education", [])
        if not isinstance(education_list, list):
            education_list = []
        
        education = [
            EducationItem(
                school=edu.get("school") or edu.get("institution") or edu.get("university"),
                degree=edu.get("degree"),
                field=edu.get("field") or edu.get("major"),
                start_date=edu.get("start_date") or edu.get("start"),
                end_date=edu.get("end_date") or edu.get("end"),
                location=edu.get("location")
            )
            for edu in education_list
            if isinstance(edu, dict)
        ]
        
        # Transform skills
        # Extracta might return skills as a simple array or we need to split technical/soft
        # Local extraction returns a simple list
        skills_data = extraction_data.get("skills", [])
        if isinstance(skills_data, str):
            # If it's a string, split by comma
            skills_list = [s.strip() for s in skills_data.split(",")]
        elif isinstance(skills_data, list):
            skills_list = skills_data
        else:
            skills_list = []
        
        # Try to separate technical and soft skills (basic heuristic)
        # In a real scenario, you might want to use a more sophisticated approach
        technical_skills = []
        soft_skills = []
        
        # Common soft skills keywords
        soft_skills_keywords = [
            "communication", "teamwork", "leadership", "problem solving",
            "creativity", "adaptability", "time management", "collaboration",
            "negotiation", "presentation", "analytical", "critical thinking"
        ]
        
        for skill in skills_list:
            if isinstance(skill, str):
                skill_lower = skill.lower()
                if any(keyword in skill_lower for keyword in soft_skills_keywords):
                    soft_skills.append(skill)
                else:
                    technical_skills.append(skill)
        
        skills = Skills(
            technical=technical_skills,
            soft=soft_skills
        )
        
        # Transform languages
        languages_list = extraction_data.get("languages", [])
        if not isinstance(languages_list, list):
            languages_list = []
        
        languages = [
            LanguageItem(
                name=lang.get("name") or lang.get("language") if isinstance(lang, dict) else str(lang),
                level=lang.get("level") or lang.get("proficiency") if isinstance(lang, dict) else None
            )
            for lang in languages_list
        ]
        
        # Create and return CVSchema
        cv_schema = CVSchema(
            personal=personal,
            profile=profile,
            skills=skills,
            experience=experience,
            education=education,
            languages=languages
        )
        
        return cv_schema
        
    except Exception as e:
        logger.error(f"Error transforming Extracta response: {str(e)}")
        logger.error(f"Extracta response structure: {json.dumps(extracta_response, indent=2)}")
        # Return empty schema on transformation error
        return CVSchema(
            personal=Personal(),
            profile=Profile(),
            skills=Skills(),
            experience=[],
            education=[],
            languages=[]
        )


def validate_cv_payload(payload: dict) -> CVSchema:
    """Validate payload against CVSchema."""
    return CVSchema.model_validate(payload)


@app.get("/healthz", status_code=status.HTTP_200_OK)
def healthz():
    return {"status": "ok"}


@app.post("/parse-cv", response_model=CVSchema)
async def parse_cv_local(file: UploadFile = File(...)):
    """
    Parse a CV PDF file using LOCAL extraction (pdfplumber).
    
    This endpoint uses local PDF parsing without requiring any external API.
    It extracts text from the PDF and uses regex patterns to identify CV information.
    
    **Use this endpoint for:**
    - Fast local processing
    - No API key required
    - Privacy (data stays on your server)
    
    The endpoint:
    1. Receives a PDF file
    2. Extracts text using pdfplumber
    3. Parses information using regex patterns
    4. Returns structured JSON that can be used to fill forms in the frontend
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
        )

    try:
        logger.info("Using LOCAL PDF extraction")
        extracta_result = parse_pdf_locally(data)
        
        # Transform response to CVSchema format
        cv_data = transform_extracta_response(extracta_result)
        
        logger.info(f"CV parsed successfully (local). Found {len(cv_data.experience)} experiences, {len(cv_data.education)} education entries")
        
        return cv_data
        
    except Exception as e:
        logger.error(f"Unexpected error during local CV parsing: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while parsing the CV: {str(e)}"
        )


@app.post("/parse-cv-external", response_model=CVSchema)
async def parse_cv_external(file: UploadFile = File(...)):
    """
    Parse a CV PDF file using EXTERNAL APIs (DocParserAI, HrFlow, Extracta).
    
    This endpoint tries multiple free APIs automatically:
    - DocParserAI (1000 pages free/month) ⭐ Recommended
    - HrFlow.ai (free tier available)
    - Extracta (if available)
    
    **Use this endpoint for:**
    - More accurate extraction (AI-powered)
    - Better structured data
    - Requires at least one API key
    
    **Configuration:**
    Add at least one API key in your .env file:
    - DOCPARSERAI_API_KEY (recommended - 1000 pages free)
    - HRFLOW_API_KEY (free tier)
    - EXTRACTA_API_KEY
    
    The endpoint:
    1. Receives a PDF file
    2. Tries available external APIs automatically
    3. Transforms the response to CVSchema format
    4. Returns structured JSON that can be used to fill forms in the frontend
    """
    # Check if at least one API is configured
    if not DOCPARSERAI_API_KEY and not NANONETS_API_KEY and not HRFLOW_API_KEY and not EXTRACTA_API_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "No external API configured. "
                "Please set at least one API key in your .env file:\n"
                "- DOCPARSERAI_API_KEY (1000 pages free/month) - Recommended\n"
                "- NANONETS_API_KEY (AI-powered extraction)\n"
                "- HRFLOW_API_KEY (free tier available)\n"
                "- EXTRACTA_API_KEY\n\n"
                "See APIS_GRATUITES.md for setup instructions. "
                "Or use /parse-cv endpoint for local extraction (no API key required)."
            )
        )

    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
        )

    try:
        logger.info("Using EXTERNAL Extracta API for extraction")
        extracta_result = call_external_api(data, file.filename, api_name="auto")
        logger.info(f"Extracta API response received for file: {file.filename}")
        
        # Transform response to CVSchema format
        cv_data = transform_extracta_response(extracta_result)
        
        logger.info(f"CV parsed successfully (external). Found {len(cv_data.experience)} experiences, {len(cv_data.education)} education entries")
        
        return cv_data
        
    except requests.exceptions.Timeout:
        logger.error("Extracta API timeout")
        raise HTTPException(
            status_code=504,
            detail="The extraction service timed out. Please try again."
        )
    except requests.exceptions.RequestException as e:
        logger.error(f"Extracta API request failed: {str(e)}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to connect to extraction service: {str(e)}"
        )
    except RuntimeError as e:
        # Handle Extracta API endpoint errors (404, etc.)
        error_msg = str(e)
        if "404" in error_msg or "endpoint not found" in error_msg.lower():
            logger.error(f"Extracta API endpoint not found: {error_msg}")
            raise HTTPException(
                status_code=502,
                detail=(
                    "Extracta API endpoint not found. The API URL may be incorrect or the service may have changed. "
                    "Please check:\n"
                    "1. Verify the Extracta API documentation for the correct endpoint URL\n"
                    "2. Set EXTRACTA_URL in your .env file with the correct endpoint\n"
                    "3. Verify your EXTRACTA_API_KEY is valid\n"
                    "Alternatively, use /parse-cv endpoint for local extraction (no API key required)."
                )
            )
        else:
            raise HTTPException(
                status_code=502,
                detail=f"Extracta API error: {error_msg}"
            )
    except Exception as e:
        logger.error(f"Unexpected error during CV parsing: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while parsing the CV: {str(e)}"
        )


@app.post("/test-nanonets")
async def test_nanonets_endpoint(
    file: UploadFile = File(...),
    output_format: str = "json"
):
    """
    Endpoint de test pour l'API Nanonets Document Extraction.
    
    Cet endpoint teste directement l'API Nanonets sans transformation,
    permettant de voir la réponse brute de l'API.
    
    **Utilisation:**
    - Upload un fichier PDF CV
    - Retourne la réponse brute de Nanonets
    - Utile pour déboguer et comprendre le format de réponse
    
    **Configuration requise:**
    - NANONETS_API_KEY dans le fichier .env
    
    **Paramètres:**
    - output_format: Format de sortie (markdown, html, json, csv). Par défaut: json
    """
    if not NANONETS_API_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "NANONETS_API_KEY is not set in environment variables.\n"
                "Please add NANONETS_API_KEY to your .env file.\n"
                "Get your API key from: https://docstrange.nanonets.com"
            )
        )
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    if output_format not in ["markdown", "html", "json", "csv"]:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid output_format: {output_format}. Must be one of: markdown, html, json, csv"
        )
    
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
        )
    
    try:
        logger.info(f"Testing Nanonets API with file: {file.filename}, format: {output_format}")
        result = call_nanonets_api(data, file.filename, output_format)
        
        logger.info("Nanonets API test successful")
        return {
            "success": True,
            "message": f"Nanonets API test successful (format: {output_format})",
            "raw_response": result,
            "summary": {
                "keys_in_response": list(result.keys()) if isinstance(result, dict) else "Not a dict",
                "response_type": type(result).__name__,
                "response_size": len(str(result))
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        error_msg = str(e)
        if "401" in error_msg or "Unauthorized" in error_msg:
            raise HTTPException(
                status_code=401,
                detail=(
                    f"Nanonets API authentication failed: {error_msg}\n"
                    "Please check your NANONETS_API_KEY in the .env file."
                )
            )
        elif "404" in error_msg:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Nanonets API endpoint not found: {error_msg}\n"
                    "Please check the API documentation: https://docstrange.nanonets.com"
                )
            )
        else:
            raise HTTPException(status_code=500, detail=f"Nanonets API error: {error_msg}")
    except Exception as e:
        logger.error(f"Unexpected error during Nanonets test: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while testing Nanonets: {str(e)}"
        )


@app.post("/test-docparserai")
async def test_docparserai_endpoint(file: UploadFile = File(...)):
    """
    Endpoint de test pour l'API DocParserAI.
    
    Cet endpoint teste directement l'API DocParserAI sans transformation,
    permettant de voir la réponse brute de l'API.
    
    **Utilisation:**
    - Upload un fichier PDF CV
    - Retourne la réponse brute de DocParserAI
    - Utile pour déboguer et comprendre le format de réponse
    
    **Configuration requise:**
    - DOCPARSERAI_API_KEY dans le fichier .env
    """
    if not DOCPARSERAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail=(
                "DOCPARSERAI_API_KEY is not set in environment variables.\n"
                "Please add DOCPARSERAI_API_KEY to your .env file."
            )
        )
    
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size is {MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
        )
    
    try:
        logger.info(f"Testing DocParserAI API with file: {file.filename}")
        result = call_docparserai_api(data, file.filename)
        
        logger.info("DocParserAI API test successful")
        return {
            "success": True,
            "message": "DocParserAI API test successful",
            "raw_response": result,
            "summary": {
                "keys_in_response": list(result.keys()) if isinstance(result, dict) else "Not a dict",
                "response_type": type(result).__name__,
                "response_size": len(str(result))
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        error_msg = str(e)
        if "401" in error_msg or "Unauthorized" in error_msg:
            raise HTTPException(
                status_code=401,
                detail=(
                    f"DocParserAI API authentication failed: {error_msg}\n"
                    "Please check your DOCPARSERAI_API_KEY in the .env file."
                )
            )
        elif "404" in error_msg:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"DocParserAI API endpoint not found: {error_msg}\n"
                    "Please check the DOCPARSERAI_URL in your .env file."
                )
            )
        else:
            raise HTTPException(status_code=500, detail=f"DocParserAI API error: {error_msg}")
    except Exception as e:
        logger.error(f"Unexpected error during DocParserAI test: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while testing DocParserAI: {str(e)}"
        )


@app.post("/parse-cv-ollama", response_model=CVSchema)
async def parse_cv_with_ollama_endpoint(file: UploadFile = File(...)):
    """
    Parse un CV PDF en utilisant Ollama (LLM local) pour extraire les informations.
    
    Cette méthode:
    1. Extrait tout le texte du PDF
    2. Envoie le texte à Ollama avec un prompt structuré
    3. Ollama génère un JSON structuré avec les informations du CV
    4. Retourne les données au format CVSchema
    
    **Configuration requise:**
    - Ollama doit être installé et démarré localement
    - Un modèle doit être téléchargé (ex: llama3.2, mistral, etc.)
    - Variables d'environnement optionnelles:
      - OLLAMA_BASE_URL (défaut: http://localhost:11434)
      - OLLAMA_MODEL (défaut: llama3.2)
    
    **Avantages:**
    - Traitement local, pas besoin d'API externe
    - Plus précis que l'extraction par regex
    - Respect de la vie privée (données restent locales)
    
    **Installation Ollama:**
    1. Télécharger depuis https://ollama.ai
    2. Installer et démarrer Ollama
    3. Télécharger un modèle: `ollama pull llama3.2`
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont supportés")

    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"Fichier trop volumineux. Taille maximale: {MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
        )

    try:
        # Étape 1: Extraire tout le texte du PDF
        logger.info("Extraction du texte du PDF...")
        pdf_text = extract_text_from_pdf(data)
        
        if not pdf_text or len(pdf_text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Le PDF ne contient pas assez de texte pour être analysé"
            )
        
        # Étape 2: Utiliser Ollama pour extraire les informations structurées
        logger.info("Analyse du CV avec Ollama...")
        cv_data_dict = parse_cv_with_ollama(pdf_text)
        
        # Étape 3: Transformer en CVSchema
        cv_data = transform_extracta_response(cv_data_dict)
        
        logger.info(
            f"CV parsé avec succès via Ollama. "
            f"Trouvé: {len(cv_data.experience)} expériences, "
            f"{len(cv_data.education)} formations, "
            f"{len(cv_data.skills.technical) + len(cv_data.skills.soft)} compétences"
        )
        
        return cv_data
        
    except RuntimeError as e:
        error_msg = str(e)
        if "Impossible de se connecter" in error_msg:
            raise HTTPException(
                status_code=503,
                detail=(
                    f"{error_msg}\n\n"
                    "Assurez-vous qu'Ollama est démarré:\n"
                    "1. Vérifiez que Ollama est installé\n"
                    "2. Démarrez Ollama: `ollama serve`\n"
                    "3. Vérifiez que le modèle est téléchargé: `ollama pull llama3.2`"
                )
            )
        raise HTTPException(status_code=500, detail=error_msg)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Erreur inattendue lors du parsing avec Ollama: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Une erreur est survenue lors du parsing du CV avec Ollama: {str(e)}"
        )

# FastAPI CV Parser

API FastAPI pour parser des CVs PDF en utilisant l'API externe Extracta et retourner les données structurées en JSON.

## Fonctionnalités

- ✅ Upload de fichiers PDF (CV)
- ✅ Extraction automatique des informations (locale avec pdfplumber ou via API Extracta)
- ✅ Transformation des données en format JSON structuré (CVSchema)
- ✅ Support pour : informations personnelles, expérience, éducation, compétences, langues
- ✅ Intégration avec le frontend Angular
- ✅ Fonctionne sans API externe (extraction locale par défaut)

## Prérequis

- Python 3.8+
- (Optionnel) Clé API Extracta si vous voulez utiliser l'API externe au lieu de l'extraction locale

## Installation et démarrage

### 1. Créer et activer l'environnement virtuel

**Windows PowerShell** :
```powershell
cd fastapi_app
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**Windows CMD** :
```cmd
cd fastapi_app
python -m venv .venv
.venv\Scripts\activate.bat
```

**Linux/Mac** :
```bash
cd fastapi_app
python -m venv .venv
source .venv/bin/activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Configuration (optionnel)

Créer un fichier `.env` dans le dossier `fastapi_app` :

**Option A : Extraction locale (recommandé, pas besoin d'API externe)**
```env
USE_LOCAL_EXTRACTION=true
```

**Option B : Utiliser l'API Extracta**
```env
USE_LOCAL_EXTRACTION=false
EXTRACTA_API_KEY=votre_cle_api_extracta
EXTRACTA_URL=https://api.extracta.ai/v1/extractions
```

**Par défaut**, l'extraction locale est activée et ne nécessite pas de clé API externe.

### 4. Lancer le serveur

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Tester avec Swagger

Ouvrez votre navigateur sur : **http://localhost:8000/docs**

Le service sera accessible sur :
- **Swagger UI**: http://localhost:8000/docs
- **API**: http://localhost:8000
- **Health check**: http://localhost:8000/healthz

## Utilisation

### Endpoints disponibles

#### 1. `/parse-cv` - Extraction locale (automatique)

**Méthode**: POST  
**Description**: Parse le CV en utilisant l'extraction locale avec pdfplumber. Rapide, ne nécessite pas de clé API.

**Avantages**:
- ✅ Pas besoin de clé API
- ✅ Rapide
- ✅ Données restent sur votre serveur (confidentialité)
- ✅ Fonctionne hors ligne

#### 2. `/parse-cv-external` - APIs externes gratuites

**Méthode**: POST  
**Description**: Parse le CV en utilisant des APIs externes gratuites. Le système essaie automatiquement toutes les APIs configurées.

**APIs supportées** (gratuites) :
- **DocParserAI** ⭐ : 1000 pages gratuites/mois (recommandé)
- **HrFlow.ai** : Plan gratuit disponible
- **Extracta** : Si disponible

**Avantages**:
- ✅ Plus précis (IA)
- ✅ Meilleure extraction de données structurées
- ✅ Fallback automatique entre plusieurs APIs
- ⚠️ Nécessite au moins une clé API dans .env

**Configuration** : Voir [APIS_GRATUITES.md](./APIS_GRATUITES.md) pour les instructions détaillées.

**Note** : Le système essaie automatiquement toutes les APIs configurées jusqu'à ce qu'une fonctionne. Si toutes échouent, utilisez `/parse-cv` pour l'extraction locale.

### Endpoint principal : `/parse-cv` (local)

**Méthode**: POST  
**Content-Type**: `multipart/form-data`

**Paramètres**:
- `file`: Fichier PDF du CV (max 8MB)

**Réponse**:
```json
{
  "personal": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone": "+33 6 12 34 56 78",
    "address": "Paris, France",
    "linkedin": "https://linkedin.com/in/johndoe",
    "github": "https://github.com/johndoe"
  },
  "profile": {
    "title": "Software Engineer",
    "summary": "Experienced backend developer..."
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
    }
  ]
}
```

### Exemple avec curl

```bash
curl -X POST http://localhost:8000/parse-cv \
  -F "file=@/chemin/vers/cv.pdf"
```

### Exemple avec le frontend Angular

Le service Angular `CvParserService` est déjà configuré pour appeler cette API :

```typescript
this.cvService.parseCv(pdfFile).subscribe({
  next: (data) => {
    // Les données sont automatiquement remplies dans le formulaire
    console.log('CV parsed:', data);
  },
  error: (err) => {
    console.error('Error:', err);
  }
});
```

## Tests

```bash
pytest
```

## Architecture

1. **Frontend Angular** → Upload du PDF
2. **FastAPI** → Reçoit le PDF
3. **Extracta API** → Extrait les données du PDF
4. **FastAPI** → Transforme la réponse en format CVSchema
5. **Frontend Angular** → Reçoit le JSON structuré et remplit le formulaire

## Notes

- La taille maximale du fichier est de 8MB
- Seuls les fichiers PDF sont acceptés
- L'API Extracta peut prendre quelques secondes pour traiter le fichier
- Les données sont transformées automatiquement pour correspondre au schéma CVSchema

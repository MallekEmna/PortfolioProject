# Configuration de Nanonets Document Extraction API

## 📋 Qu'est-ce que Nanonets ?

Nanonets est une API d'extraction de documents alimentée par l'IA qui peut convertir des PDFs, images, Word, Excel en formats structurés (Markdown, HTML, JSON, CSV).

### ✨ Avantages

- ✅ **Multi-formats de sortie** : Markdown, HTML, JSON, CSV
- ✅ **Support multilingue** : 29+ langues supportées
- ✅ **Instructions personnalisées** : Guidez l'extraction selon vos besoins
- ✅ **Traitement en temps réel** : Résultats synchrones ou streaming
- ✅ **Traitement par lots** : Jusqu'à 50 documents en une seule requête

## 🔧 Configuration

### 1. Obtenir votre clé API

1. Allez sur https://docstrange.nanonets.com
2. Créez un compte ou connectez-vous
3. Dans le menu en haut à droite, récupérez votre **API Key**

### 2. Configurer le fichier .env

Ajoutez cette ligne dans votre fichier `fastapi_app/.env` :

```env
NANONETS_API_KEY=votre_cle_api_ici
```

### 3. Exemple de configuration complète

```env
# Nanonets API
NANONETS_API_KEY=sk_live_abc123xyz789...
```

## 🧪 Test de l'API

### Méthode 1: Via Swagger UI (Recommandé)

1. **Démarrer le serveur FastAPI:**
   ```powershell
   cd fastapi_app
   .venv\Scripts\Activate.ps1
   uvicorn main:app --reload
   ```

2. **Ouvrir Swagger UI:**
   - Allez sur: http://localhost:8000/docs
   - Trouvez l'endpoint `POST /test-nanonets`
   - Cliquez sur "Try it out"
   - Sélectionnez un fichier PDF
   - Choisissez le format de sortie (json, markdown, html, csv)
   - Cliquez sur "Execute"

### Méthode 2: Via curl

```powershell
# Format JSON (par défaut)
curl -X 'POST' `
  'http://localhost:8000/test-nanonets?output_format=json' `
  -H 'accept: application/json' `
  -H 'Authorization: Bearer YOUR_API_KEY' `
  -F 'file=@votre_cv.pdf;type=application/pdf'

# Format Markdown
curl -X 'POST' `
  'http://localhost:8000/test-nanonets?output_format=markdown' `
  -H 'accept: application/json' `
  -F 'file=@votre_cv.pdf;type=application/pdf'
```

### Méthode 3: Via l'endpoint principal

L'endpoint `/parse-cv-external` utilisera automatiquement Nanonets si la clé API est configurée :

```powershell
curl -X 'POST' `
  'http://localhost:8000/parse-cv-external' `
  -H 'accept: application/json' `
  -F 'file=@votre_cv.pdf;type=application/pdf'
```

## 📊 Formats de sortie disponibles

### JSON (Recommandé pour CVs)
```json
{
  "personal": {
    "full_name": "...",
    "email": "..."
  },
  "experience": [...],
  "education": [...]
}
```

### Markdown
```markdown
# John Doe
Email: john@example.com
...
```

### HTML
```html
<h1>John Doe</h1>
<p>Email: john@example.com</p>
...
```

### CSV
Pour les documents avec des tableaux uniquement.

## 🌍 Support multilingue

Nanonets supporte automatiquement 29+ langues :

**Tier 1 (Performance exceptionnelle):**
- Chinois (Simplifié & Traditionnel)
- Anglais
- Japonais
- Coréen

**Tier 2 (Performance forte):**
- Espagnol, Français, Allemand, Italien, Portugais
- Russe, Arabe, Hindi, Thaï, Vietnamien

**Tier 3 (Performance bonne):**
- Indonésien, Malaisien, Turc, Polonais, Néerlandais, etc.

Le modèle détecte automatiquement la langue - aucune configuration requise !

## ⚙️ Options avancées

### Instructions personnalisées

L'endpoint utilise déjà des instructions personnalisées pour extraire les informations de CV. Vous pouvez les modifier dans le code si nécessaire.

### Métadonnées

Pour inclure des métadonnées supplémentaires (bounding boxes, confidence scores), modifiez la fonction `call_nanonets_api` dans `main.py`.

## 📈 Limites et quotas

- **Sync processing** : Recommandé pour documents < 50 pages
- **Async processing** : Pour documents plus volumineux
- **Batch processing** : Maximum 50 fichiers par requête
- **Rate limits** : Dépendent de votre plan

## ❌ Dépannage

### Erreur: "NANONETS_API_KEY is not set"
- Vérifiez que le fichier `.env` est dans le dossier `fastapi_app`
- Vérifiez que la clé est bien formatée (sans espaces)
- Redémarrez le serveur FastAPI après modification du `.env`

### Erreur: "401 Unauthorized"
- Vérifiez que votre clé API est correcte
- Vérifiez que vous n'avez pas dépassé votre quota

### Erreur: "Timeout"
- Les documents volumineux peuvent prendre plus de temps
- Le timeout est fixé à 120 secondes par défaut
- Pour des documents très volumineux, utilisez l'extraction asynchrone

## 🔗 Documentation officielle

- **API Reference** : https://docstrange.nanonets.com
- **Dashboard** : https://docstrange.nanonets.com
- **Support** : Contactez le support via le dashboard

## 💡 Comparaison avec les autres APIs

| API | Précision | Vitesse | Coût | Multilingue |
|-----|-----------|---------|------|-------------|
| **Nanonets** | ⭐⭐⭐⭐⭐ | ⚡⚡ | Payant | ✅ 29+ langues |
| DocParserAI | ⭐⭐⭐⭐ | ⚡⚡ | Gratuit (1000 pages/mois) | ✅ |
| Ollama | ⭐⭐⭐ | ⚡ | Gratuit (local) | ⚠️ Limité |
| Local | ⭐⭐ | ⚡⚡⚡ | Gratuit | ❌ |

## 🎯 Quand utiliser Nanonets ?

- ✅ Vous avez besoin d'une extraction très précise
- ✅ Vous travaillez avec des documents multilingues
- ✅ Vous voulez plusieurs formats de sortie
- ✅ Vous avez un budget pour une API premium
- ✅ Vous avez besoin de métadonnées détaillées


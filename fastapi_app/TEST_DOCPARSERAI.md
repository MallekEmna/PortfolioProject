# Guide de test pour DocParserAI

## ✅ Configuration vérifiée

Votre clé API DocParserAI est configurée dans le fichier `.env`:
```
DOCPARSERAI_API_KEY=9d1b24b1ca7c7b8cec92599b7ff11a4b52ce4978
```

## 🧪 Méthodes de test

### Méthode 1: Test via Swagger UI (Recommandé)

1. **Démarrer le serveur FastAPI:**
   ```powershell
   cd fastapi_app
   .venv\Scripts\Activate.ps1
   uvicorn main:app --reload
   ```

2. **Ouvrir Swagger UI:**
   - Allez sur: http://localhost:8000/docs
   - Trouvez l'endpoint `POST /parse-cv-external`
   - Cliquez sur "Try it out"
   - Cliquez sur "Choose File" et sélectionnez votre PDF CV
   - Cliquez sur "Execute"
   - Vérifiez la réponse JSON

### Méthode 2: Test avec curl

```powershell
curl -X 'POST' `
  'http://localhost:8000/parse-cv-external' `
  -H 'accept: application/json' `
  -H 'Content-Type: multipart/form-data' `
  -F 'file=@MALLEK_Emna.pdf;type=application/pdf'
```

### Méthode 3: Test avec le script Python

```powershell
cd fastapi_app
.venv\Scripts\Activate.ps1
python test_docparserai.py ..\MALLEK_Emna.pdf
```

Ce script teste:
- ✅ L'appel direct à l'API DocParserAI
- ✅ L'appel via votre serveur FastAPI

### Méthode 4: Test depuis le frontend Angular

1. Démarrer le serveur FastAPI (voir Méthode 1)
2. Démarrer le frontend Angular
3. Aller sur la page CV Upload
4. Sélectionner "External API" comme méthode
5. Uploader un PDF
6. Vérifier que les données sont extraites

## 🔍 Vérification

L'API DocParserAI devrait extraire:
- ✅ Informations personnelles (nom, email, téléphone)
- ✅ Expériences professionnelles
- ✅ Formations
- ✅ Compétences
- ✅ Langues

## ❌ Dépannage

### Erreur: "DOCPARSERAI_API_KEY is not set"
- Vérifiez que le fichier `.env` est dans le dossier `fastapi_app`
- Vérifiez que la clé est bien formatée (sans espaces)
- Redémarrez le serveur FastAPI après modification du `.env`

### Erreur: "DocParserAI API failed: 401"
- Vérifiez que votre clé API est correcte
- Vérifiez que vous n'avez pas dépassé la limite de 1000 pages/mois

### Erreur: "Failed to connect to DocParserAI API"
- Vérifiez votre connexion internet
- Vérifiez que l'URL de l'API est correcte: `https://api.docparserai.com/v1/extract`

## 📊 Logs

Les logs du serveur FastAPI afficheront:
```
INFO: Trying docparserai API...
INFO: Successfully parsed with docparserai API
```

Si vous voyez des erreurs, elles seront également affichées dans les logs.


# 🔧 Dépannage - Erreur 404 Extracta API

## Problème : Erreur 404 "Cannot POST /v1/createExtraction"

Cette erreur signifie que l'URL de l'API Extracta est incorrecte ou que l'endpoint a changé.

## Solutions

### 1. Vérifier la documentation Extracta

Consultez la documentation officielle d'Extracta pour trouver la bonne URL :
- https://extracta.ai/documentation
- https://docs.extracta.ai

### 2. Vérifier votre clé API

Assurez-vous que votre clé API est correcte dans le fichier `.env` :
```env
EXTRACTA_API_KEY=votre_cle_api_ici
```

### 3. Configurer l'URL manuellement

Si vous connaissez la bonne URL, ajoutez-la dans votre fichier `.env` :
```env
EXTRACTA_API_KEY=votre_cle_api
EXTRACTA_URL=https://api.extracta.ai/v1/extractions
```

### 4. Formats d'URL possibles à essayer

Le code essaie automatiquement ces URLs :
- `https://api.extracta.ai/v1/extractions`
- `https://api.extracta.ai/v1/createExtraction`
- `https://api.extracta.ai/extractions`
- `https://extracta.ai/api/v1/extractions`

### 5. Vérifier le format de la requête

L'API Extracta peut nécessiter un format différent. Vérifiez dans la documentation si :
- Le format `extractionDetails` est correct
- Les headers sont corrects
- Le format du fichier est accepté

### 6. Tester avec curl

Testez directement avec curl pour voir la réponse exacte :
```bash
curl -X POST "https://api.extracta.ai/v1/extractions" \
  -H "Authorization: Bearer VOTRE_CLE_API" \
  -F "file=@votre_cv.pdf" \
  -F "extractionDetails={\"name\":\"Resume Extraction\"}"
```

## Alternative : Utiliser une autre API

Si Extracta ne fonctionne pas, vous pouvez utiliser d'autres services :
- **Adobe PDF Services API**
- **Google Cloud Document AI**
- **AWS Textract**
- **PyPDF2** ou **pdfplumber** pour une extraction basique

## Logs

Vérifiez les logs du serveur pour voir quelles URLs ont été essayées :
```
INFO: Trying alternative URL: https://api.extracta.ai/v1/createExtraction
WARNING: Failed with https://api.extracta.ai/v1/createExtraction: ...
```


# 🔌 Configuration pour utiliser l'API externe Extracta

## Étapes pour activer l'API Extracta

### 1. Créer le fichier `.env`

Dans le dossier `fastapi_app`, créez un fichier `.env` avec le contenu suivant :

```env
# Désactiver l'extraction locale pour utiliser l'API externe
USE_LOCAL_EXTRACTION=false

# Votre clé API Extracta (obligatoire)
EXTRACTA_API_KEY=votre_cle_api_extracta_ici

# URL de l'API Extracta (optionnel, le code essaiera plusieurs URLs)
EXTRACTA_URL=https://api.extracta.ai/v1/extractions
```

### 2. Obtenir votre clé API Extracta

1. Allez sur https://extracta.ai
2. Créez un compte ou connectez-vous
3. Accédez à votre tableau de bord
4. Générez ou copiez votre clé API

### 3. Tester la configuration

1. **Redémarrer le serveur FastAPI** :
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Vérifier les logs** :
   Vous devriez voir : `"Using Extracta API for extraction"`

3. **Tester dans Swagger** :
   - Allez sur http://localhost:8000/docs
   - Testez l'endpoint `/parse-cv` avec un PDF

## 🔄 Fallback automatique

Si l'API Extracta échoue (erreur 404, timeout, etc.), l'application basculera automatiquement vers l'extraction locale. Vous verrez dans les logs :
```
WARNING: Extracta API failed: ...
INFO: Using local PDF extraction as fallback
```

## ⚠️ Dépannage

### Erreur 404 - Endpoint non trouvé

Si vous obtenez une erreur 404, cela signifie que l'URL de l'API Extracta est incorrecte ou que l'API n'existe plus/à changé. 

**Le code essaie automatiquement plusieurs URLs :**
1. `https://api.extracta.ai/v1/extractions`
2. `https://api.extracta.ai/v1/createExtraction`
3. `https://api.extracta.ai/extractions`
4. `https://extracta.ai/api/v1/extractions`

**Si toutes les URLs retournent 404 :**

1. **Vérifiez la documentation Extracta** :
   - Allez sur https://extracta.ai/documentation
   - Vérifiez la bonne URL d'endpoint
   - Vérifiez si l'API est toujours disponible

2. **Vérifiez votre clé API** :
   - Assurez-vous que votre `EXTRACTA_API_KEY` est valide
   - Vérifiez qu'elle n'a pas expiré

3. **Solution alternative** :
   - Utilisez l'endpoint `/parse-cv` pour l'extraction locale (pas besoin d'API)
   - Ou utilisez une autre API de parsing de documents (Adobe, Google Cloud Document AI, etc.)

**Note importante** : Si l'API Extracta n'est plus disponible ou a changé, l'endpoint `/parse-cv-external` retournera une erreur HTTP 502 avec un message explicite. Utilisez `/parse-cv` pour l'extraction locale qui fonctionne sans API externe.

### Erreur 401 - Non autorisé

Vérifiez que votre `EXTRACTA_API_KEY` est correcte et active.

### Erreur de timeout

L'API Extracta peut prendre du temps. Le timeout est fixé à 60 secondes. Si c'est insuffisant, vous pouvez l'augmenter dans le code.

## 📝 Exemple de fichier `.env` complet

```env
# Mode d'extraction
USE_LOCAL_EXTRACTION=false

# Clé API Extracta
EXTRACTA_API_KEY=sk_live_votre_cle_ici_123456789

# URL de l'API (optionnel)
EXTRACTA_URL=https://api.extracta.ai/v1/extractions
```

## 🔍 Vérifier que l'API est utilisée

Dans les logs du serveur, vous devriez voir :
```
INFO: Using Extracta API for extraction
INFO: Extracta API response received for file: votre_cv.pdf
```

Si vous voyez `"Using local PDF extraction"`, cela signifie que :
- `USE_LOCAL_EXTRACTION=true` est défini, OU
- `EXTRACTA_API_KEY` n'est pas défini, OU
- L'API Extracta a échoué et le fallback local a été utilisé


# 🆓 APIs Gratuites pour Parser des CVs

Ce document liste les APIs gratuites que vous pouvez utiliser pour parser des CVs PDF.

## 📋 APIs Disponibles

### 1. DocParserAI ⭐ (Recommandé)

**Gratuit** : 1000 pages/mois  
**Site** : https://docparserai.com  
**Précision** : 99%

#### Configuration

1. Créez un compte sur https://docparserai.com
2. Obtenez votre clé API dans le tableau de bord
3. Ajoutez dans votre `.env` :
   ```env
   DOCPARSERAI_API_KEY=votre_cle_api_ici
   ```

#### Avantages
- ✅ 1000 pages gratuites par mois
- ✅ Très précis (99%)
- ✅ Supporte plusieurs langues
- ✅ Extraction structurée automatique

---

### 2. HrFlow.ai

**Gratuit** : Plan gratuit disponible  
**Site** : https://hrflow.ai  
**Support** : 32+ langues

#### Configuration

1. Créez un compte sur https://hrflow.ai
2. Obtenez votre clé API (X-API-KEY)
3. Ajoutez dans votre `.env` :
   ```env
   HRFLOW_API_KEY=votre_cle_api_ici
   ```

#### Avantages
- ✅ Plan gratuit disponible
- ✅ Supporte 32+ langues
- ✅ API de parsing spécialisée RH
- ✅ Format JSON structuré

---

### 3. Extracta (si disponible)

**Gratuit** : Essai gratuit  
**Site** : https://extracta.ai

#### Configuration

1. Créez un compte sur https://extracta.ai
2. Obtenez votre clé API
3. Ajoutez dans votre `.env` :
   ```env
   EXTRACTA_API_KEY=votre_cle_api_ici
   EXTRACTA_URL=https://api.extracta.ai/v1/extractions
   ```

**Note** : Cette API peut ne plus être disponible ou avoir changé d'URL.

---

## 🚀 Configuration Rapide

### Option 1 : DocParserAI (Recommandé)

```env
# Dans fastapi_app/.env
DOCPARSERAI_API_KEY=9d1b24b1ca7c7b8cec92599b7ff11a4b52ce4978
```

### Option 2 : HrFlow.ai

```env
# Dans fastapi_app/.env
HRFLOW_API_KEY=votre_cle_hrflow
```

### Option 3 : Plusieurs APIs (Auto-fallback)

```env
# Le système essaiera automatiquement toutes les APIs configurées
DOCPARSERAI_API_KEY=votre_cle_docparserai
HRFLOW_API_KEY=votre_cle_hrflow
EXTRACTA_API_KEY=votre_cle_extracta
```

Le système essaiera automatiquement les APIs dans cet ordre :
1. DocParserAI
2. HrFlow.ai
3. Extracta

## 📝 Exemple de fichier `.env` complet

```env
# Extraction locale (par défaut, pas besoin de clé)
USE_LOCAL_EXTRACTION=true

# APIs externes (choisissez une ou plusieurs)
DOCPARSERAI_API_KEY=sk_live_votre_cle_ici
HRFLOW_API_KEY=votre_cle_hrflow_ici
EXTRACTA_API_KEY=votre_cle_extracta_ici

# URLs (optionnel, valeurs par défaut utilisées)
DOCPARSERAI_URL=https://api.docparserai.com/v1/extract
HRFLOW_URL=https://api.hrflow.ai/v1/documents/parsing
EXTRACTA_URL=https://api.extracta.ai/v1/extractions
```

## 🧪 Tester les APIs

### Dans Swagger

1. Allez sur http://localhost:8000/docs
2. Utilisez l'endpoint `/parse-cv-external`
3. Le système essaiera automatiquement toutes les APIs configurées

### Vérifier les logs

Dans les logs du serveur, vous verrez :
```
INFO: Trying docparserai API...
INFO: Successfully parsed with docparserai API
```

Ou si une API échoue :
```
WARNING: docparserai API failed: ...
INFO: Trying hrflow API...
```

## 💡 Recommandation

**Pour commencer rapidement** : Utilisez **DocParserAI** car il offre 1000 pages gratuites par mois et est très précis.

**Pour la production** : Configurez plusieurs APIs pour avoir un fallback automatique si une API est indisponible.

## 🔄 Fallback Automatique

Le système essaie automatiquement toutes les APIs configurées jusqu'à ce qu'une fonctionne. Si toutes échouent, vous pouvez toujours utiliser l'endpoint `/parse-cv` pour l'extraction locale.

## 📚 Documentation

- **DocParserAI** : https://docparserai.com/documentation
- **HrFlow.ai** : https://developers.hrflow.ai
- **Extracta** : https://extracta.ai/documentation




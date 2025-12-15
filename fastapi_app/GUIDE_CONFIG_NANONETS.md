# Guide rapide : Configuration Nanonets API

## ⚡ Configuration en 3 étapes

### Étape 1 : Obtenir votre clé API

1. Allez sur **https://docstrange.nanonets.com**
2. Créez un compte ou connectez-vous
3. Dans le **menu en haut à droite**, cliquez sur votre profil
4. Copiez votre **API Key** (commence généralement par `sk_` ou similaire)

### Étape 2 : Ajouter la clé dans le fichier .env

Ouvrez le fichier `fastapi_app/.env` et ajoutez :

```env
NANONETS_API_KEY=votre_cle_api_ici
```

**Exemple :**
```env
NANONETS_API_KEY=sk_live_abc123xyz789...
```

### Étape 3 : Redémarrer le serveur FastAPI

⚠️ **IMPORTANT** : Après avoir modifié le fichier `.env`, vous devez **redémarrer** le serveur FastAPI pour que les changements prennent effet.

```powershell
# Arrêtez le serveur (Ctrl+C)
# Puis redémarrez :
cd fastapi_app
.venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

## ✅ Vérification

Une fois configuré, testez l'endpoint :

1. Allez sur http://localhost:8000/docs
2. Trouvez `POST /test-nanonets`
3. Testez avec un PDF

Si vous voyez encore l'erreur, vérifiez :
- ✅ Le fichier `.env` est bien dans le dossier `fastapi_app/`
- ✅ La clé API est sur une seule ligne, sans espaces
- ✅ Le serveur FastAPI a été redémarré après modification

## 🔍 Emplacement du fichier .env

Le fichier `.env` doit être dans :
```
D:\TpAngular\Projet_Portolio\fastapi_app\.env
```

## 📝 Format correct du fichier .env

```env
# Autres variables existantes...
DOCPARSERAI_API_KEY=9d1b24b1ca7c7b8cec92599b7ff11a4b52ce4978

# Ajoutez cette ligne :
NANONETS_API_KEY=votre_cle_api_ici
```

**⚠️ Ne pas mettre d'espaces autour du `=`**

## 🆘 Aide supplémentaire

Si vous avez des problèmes :
1. Vérifiez que la clé API est valide sur https://docstrange.nanonets.com
2. Vérifiez les logs du serveur FastAPI pour plus de détails
3. Consultez `CONFIG_NANONETS.md` pour la documentation complète


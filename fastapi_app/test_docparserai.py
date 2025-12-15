"""
Script de test pour l'API DocParserAI
Usage: python test_docparserai.py <path_to_pdf_file>
"""
import sys
import os
import requests
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

DOCPARSERAI_API_KEY = os.getenv("DOCPARSERAI_API_KEY")
DOCPARSERAI_URL = os.getenv("DOCPARSERAI_URL", "https://api.docparserai.com/v1/extract")

def test_docparserai_direct(pdf_path: str):
    """Test direct de l'API DocParserAI"""
    if not DOCPARSERAI_API_KEY:
        print("❌ ERREUR: DOCPARSERAI_API_KEY n'est pas définie dans le fichier .env")
        return False
    
    if not os.path.exists(pdf_path):
        print(f"❌ ERREUR: Le fichier PDF n'existe pas: {pdf_path}")
        return False
    
    print(f"🔑 Clé API: {DOCPARSERAI_API_KEY[:20]}...")
    print(f"📄 Fichier PDF: {pdf_path}")
    print(f"🌐 URL API: {DOCPARSERAI_URL}")
    print("\n⏳ Envoi de la requête à DocParserAI...")
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {
                "file": (os.path.basename(pdf_path), f.read(), "application/pdf")
            }
        
        headers = {
            "Authorization": f"Bearer {DOCPARSERAI_API_KEY}",
            "Accept": "application/json"
        }
        
        data = {
            "document_type": "resume",
            "language": "en"
        }
        
        response = requests.post(
            DOCPARSERAI_URL,
            headers=headers,
            files=files,
            data=data,
            timeout=60
        )
        
        print(f"📊 Code de statut: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCÈS! Réponse reçue de DocParserAI:")
            print(f"\n📋 Résumé de la réponse:")
            print(f"   - Clés disponibles: {list(result.keys())}")
            
            # Afficher quelques informations extraites si disponibles
            if 'personal' in result or 'name' in result:
                print("\n👤 Informations personnelles extraites:")
                personal = result.get('personal', result.get('name', 'N/A'))
                print(f"   {personal}")
            
            if 'email' in result:
                print(f"\n📧 Email: {result.get('email')}")
            
            if 'phone' in result:
                print(f"📞 Téléphone: {result.get('phone')}")
            
            if 'experience' in result or 'work_experience' in result:
                exp = result.get('experience', result.get('work_experience', []))
                print(f"\n💼 Expériences: {len(exp) if isinstance(exp, list) else 'N/A'}")
            
            print(f"\n📄 Réponse complète (premiers 500 caractères):")
            print(str(result)[:500])
            
            return True
        else:
            print(f"❌ ERREUR: {response.status_code}")
            print(f"📄 Réponse: {response.text[:500]}")
            return False
            
    except Exception as e:
        print(f"❌ ERREUR lors de l'appel à l'API: {str(e)}")
        return False


def test_via_fastapi(pdf_path: str):
    """Test via le serveur FastAPI local"""
    if not os.path.exists(pdf_path):
        print(f"❌ ERREUR: Le fichier PDF n'existe pas: {pdf_path}")
        return False
    
    print(f"\n🧪 Test via FastAPI (http://localhost:8000)")
    print(f"📄 Fichier PDF: {pdf_path}")
    print("\n⏳ Envoi de la requête...")
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {
                "file": (os.path.basename(pdf_path), f.read(), "application/pdf")
            }
        
        response = requests.post(
            "http://localhost:8000/parse-cv-external",
            files=files,
            timeout=120
        )
        
        print(f"📊 Code de statut: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCCÈS! CV parsé avec succès:")
            print(f"\n👤 Nom: {result.get('personal', {}).get('full_name', 'N/A')}")
            print(f"📧 Email: {result.get('personal', {}).get('email', 'N/A')}")
            print(f"📞 Téléphone: {result.get('personal', {}).get('phone', 'N/A')}")
            print(f"💼 Expériences: {len(result.get('experience', []))}")
            print(f"🎓 Formations: {len(result.get('education', []))}")
            print(f"🌐 Langues: {len(result.get('languages', []))}")
            print(f"🛠️ Compétences techniques: {len(result.get('skills', {}).get('technical', []))}")
            
            return True
        else:
            print(f"❌ ERREUR: {response.status_code}")
            print(f"📄 Détails: {response.text[:500]}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERREUR: Le serveur FastAPI n'est pas démarré.")
        print("   Démarrez-le avec: cd fastapi_app && uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_docparserai.py <path_to_pdf_file>")
        print("\nExemple:")
        print("  python test_docparserai.py ../MALLEK_Emna.pdf")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    print("=" * 60)
    print("🧪 TEST DE L'API DOCPARSERAI")
    print("=" * 60)
    
    # Test 1: Direct API call
    print("\n1️⃣ Test direct de l'API DocParserAI")
    print("-" * 60)
    direct_success = test_docparserai_direct(pdf_path)
    
    # Test 2: Via FastAPI
    print("\n2️⃣ Test via FastAPI")
    print("-" * 60)
    fastapi_success = test_via_fastapi(pdf_path)
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ")
    print("=" * 60)
    print(f"Test direct DocParserAI: {'✅ SUCCÈS' if direct_success else '❌ ÉCHEC'}")
    print(f"Test via FastAPI: {'✅ SUCCÈS' if fastapi_success else '❌ ÉCHEC'}")
    
    if direct_success:
        print("\n✅ L'API DocParserAI fonctionne correctement!")
    else:
        print("\n❌ Vérifiez votre clé API et la connexion internet.")


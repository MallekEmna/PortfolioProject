"""
Script de test direct pour l'API Nanonets
Usage: python test_nanonets_direct.py <path_to_pdf_file>
"""
import sys
import os
import requests
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

NANONETS_API_KEY = os.getenv("NANONETS_API_KEY")
NANONETS_BASE_URL = "https://extraction-api.nanonets.com/api/v1"

def test_nanonets_direct(pdf_path: str, output_format: str = "json"):
    """Test direct de l'API Nanonets"""
    if not NANONETS_API_KEY:
        print("❌ ERREUR: NANONETS_API_KEY n'est pas définie dans le fichier .env")
        return False
    
    if not os.path.exists(pdf_path):
        print(f"❌ ERREUR: Le fichier PDF n'existe pas: {pdf_path}")
        return False
    
    print(f"🔑 Clé API: {NANONETS_API_KEY[:20]}...")
    print(f"📄 Fichier PDF: {pdf_path}")
    print(f"🌐 URL API: {NANONETS_BASE_URL}/extract/sync")
    print(f"📊 Format de sortie: {output_format}")
    print("\n⏳ Envoi de la requête à Nanonets...")
    
    try:
        with open(pdf_path, 'rb') as f:
            files = {
                "file": (os.path.basename(pdf_path), f.read(), "application/pdf")
            }
        
        headers = {
            "Authorization": f"Bearer {NANONETS_API_KEY}",
            "Accept": "application/json"
        }
        
        data = {
            "output_format": output_format,
            "custom_instructions": (
                "Extract CV information including: personal details (name, email, phone, address, linkedin, github), "
                "profile (title, summary), skills (technical and soft skills), work experience (company, role, dates, description, location), "
                "education (school, degree, field, dates, location), and languages (name, level). "
                "Format dates as YYYY-MM or YYYY. Return structured JSON."
            )
        }
        
        response = requests.post(
            f"{NANONETS_BASE_URL}/extract/sync",
            headers=headers,
            files=files,
            data=data,
            timeout=120
        )
        
        print(f"📊 Code de statut: {response.status_code}")
        print(f"📋 Headers de réponse: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print("✅ SUCCÈS! Réponse reçue de Nanonets:")
                print(f"\n📋 Résumé de la réponse:")
                print(f"   - Type: {type(result).__name__}")
                if isinstance(result, dict):
                    print(f"   - Clés disponibles: {list(result.keys())}")
                    print(f"\n📄 Réponse complète (premiers 1000 caractères):")
                    print(str(result)[:1000])
                else:
                    print(f"   - Contenu: {str(result)[:500]}")
                
                return True
            except Exception as e:
                print(f"⚠️ Réponse reçue mais erreur lors du parsing JSON: {str(e)}")
                print(f"📄 Réponse brute (premiers 500 caractères):")
                print(response.text[:500])
                return True
        else:
            print(f"❌ ERREUR: {response.status_code}")
            print(f"📄 Réponse complète:")
            print(response.text)
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ ERREUR lors de l'appel à l'API: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"📊 Code de statut: {e.response.status_code}")
            print(f"📄 Réponse: {e.response.text[:500]}")
        return False
    except Exception as e:
        print(f"❌ ERREUR inattendue: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_nanonets_direct.py <path_to_pdf_file> [output_format]")
        print("\nExemple:")
        print("  python test_nanonets_direct.py ../MALLEK_Emna.pdf")
        print("  python test_nanonets_direct.py ../MALLEK_Emna.pdf json")
        print("  python test_nanonets_direct.py ../MALLEK_Emna.pdf markdown")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_format = sys.argv[2] if len(sys.argv) > 2 else "json"
    
    if output_format not in ["json", "markdown", "html", "csv"]:
        print(f"❌ Format invalide: {output_format}. Utilisez: json, markdown, html, csv")
        sys.exit(1)
    
    print("=" * 60)
    print("🧪 TEST DIRECT DE L'API NANONETS")
    print("=" * 60)
    
    success = test_nanonets_direct(pdf_path, output_format)
    
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ")
    print("=" * 60)
    if success:
        print("✅ Test réussi!")
    else:
        print("❌ Test échoué")
        print("\nVérifiez:")
        print("1. Que votre clé API est correcte")
        print("2. Que vous avez des crédits disponibles")
        print("3. Que le fichier PDF est valide")
        print("4. Votre connexion internet")




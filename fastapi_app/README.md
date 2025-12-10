# fastapi-cv-parser

## Installation (local)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r fastapi_app/requirements.txt## Lancer le service
uvicorn fastapi_app.main:app --host 0.0.0.0 --port 8000Swagger UI: http://localhost:8000/docs  
ReDoc: http://localhost:8000/redoc  
Health check: http://localhost:8000/healthz

## Tester l'API
curl -X POST http://localhost:8000/parse-cv \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/chemin/vers/cv.pdf"Healthz:
curl http://localhost:8000/healthz## Tests
pytest## Docker
docker build -t fastapi-cv-parser .
docker run -p 8000:8000 fastapi-cv-parser
import json
import logging
import subprocess
from pathlib import Path
from typing import Tuple

import pdfplumber
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from .schemas import CVSchema

# Basic logger setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fastapi-cv-parser")

app = FastAPI(
    title="fastapi-cv-parser",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PROMPT_PATH = Path(__file__).parent / "prompt_template.txt"
MAX_FILE_SIZE = 8 * 1024 * 1024  # 8MB
OLLAMA_MODEL = "llama3"  


def extract_text_from_pdf(data: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber."""
    with pdfplumber.open(bytes(data)) as pdf:
        texts = []
        for page in pdf.pages:
            txt = page.extract_text() or ""
            texts.append(txt)
        return "\n".join(texts).strip()


def build_prompt(cv_text: str) -> str:
    """Build the LLM prompt by injecting CV text into the template."""
    template = PROMPT_PATH.read_text(encoding="utf-8")
    return template.replace("{{CV_TEXT}}", cv_text)


def call_ollama(prompt: str) -> str:
    """
    Call Ollama via subprocess.
    Variant A (implemented): CLI call.
    Variant B (commented): HTTP call to local Ollama API (to adapt).
    """
    cmd = ["ollama", "run", OLLAMA_MODEL]
    try:
        # Implemented: subprocess call
        proc = subprocess.run(
            cmd,
            input=prompt.encode("utf-8"),
            capture_output=True,
            check=False,
            timeout=60,
        )
        stdout = proc.stdout.decode("utf-8", errors="ignore")
        stderr = proc.stderr.decode("utf-8", errors="ignore")
        if proc.returncode != 0:
            logger.error("Ollama error: %s", stderr)
            raise RuntimeError(f"Ollama returned non-zero exit code: {proc.returncode}")
        return stdout

        # Variant B (HTTP) - TODO: implement if preferred
        # import requests
        # resp = requests.post(
        #     "http://localhost:11434/api/generate",
        #     json={"model": OLLAMA_MODEL, "prompt": prompt},
        #     timeout=60,
        # )
        # resp.raise_for_status()
        # return resp.text
    except subprocess.TimeoutExpired:
        logger.error("Ollama call timed out")
        raise
    except Exception as exc:
        logger.error("Error calling Ollama: %s", exc)
        raise


def parse_json_from_output(raw: str) -> dict:
    """Parse JSON from LLM output; try full load, then fallback to substring between braces."""
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback: extract substring between first '{' and last '}'
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            sub = raw[start : end + 1]
            return json.loads(sub)
        raise


def validate_cv_payload(payload: dict) -> CVSchema:
    """Validate payload against CVSchema."""
    return CVSchema.parse_obj(payload)


@app.get("/healthz", status_code=status.HTTP_200_OK)
def healthz():
    return {"status": "ok"}


@app.post(
    "/parse-cv",
    response_model=CVSchema,
    status_code=status.HTTP_200_OK,
    summary="Parse a CV PDF and return structured JSON",
)
async def parse_cv(file: UploadFile = File(...)):
    # Validate content type
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File must be a PDF")

    # Read file bytes with size limit
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (max 8MB)")

    # Extract text
    try:
        text = extract_text_from_pdf(data)
    except Exception as exc:
        logger.error("PDF extraction failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to read PDF")

    ocr_required = False
    if len(text) < 50:
        logger.warning("Low text content detected; OCR may be required")
        ocr_required = True
        # TODO: Add OCR fallback (e.g., Tesseract) if needed

    # Build prompt
    prompt = build_prompt(text)

    # Call LLM (Ollama)
    try:
        raw_output = call_ollama(prompt)
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="LLM call timed out")
    except Exception:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="LLM call failed")

    # Parse JSON
    try:
        parsed = parse_json_from_output(raw_output)
    except Exception as exc:
        logger.error("JSON parse error: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to parse LLM output as JSON")

    # Validate schema
    try:
        validated = validate_cv_payload(parsed)
    except ValidationError as exc:
        logger.error("Validation error: %s", exc)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Validation failed on LLM output")

    # Prepare response
    headers = {}
    if ocr_required:
        headers["x-ocr-required"] = "true"

    return validated.dict(), headers
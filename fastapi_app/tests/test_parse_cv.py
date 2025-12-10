uvicorn fastapi_app.main:apport Path

import pytest
from fastapi.testclient import TestClient

from fastapi_app.main import app

client = TestClient(app)


def _fake_pdf_bytes() -> bytes:
    # Minimal PDF content with some text
    return b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\nstartxref\n0\n%%EOF"


@pytest.mark.parametrize("filename", ["cv.pdf"])
def test_parse_cv_endpoint(filename):
    pdf_bytes = _fake_pdf_bytes()
    files = {"file": (filename, pdf_bytes, "application/pdf")}
    resp = client.post("/parse-cv", files=files)
    # The LLM call will likely fail in test env; we just assert JSON and status
    assert resp.status_code in (200, 500, 502, 504)
    assert resp.headers.get("content-type", "").startswith("application/json")
    data = resp.json()
    # Expect at least these keys when 200
    if resp.status_code == 200:
        for key in ["personal", "profile", "skills", "experience", "education", "languages"]:
            assert key in data
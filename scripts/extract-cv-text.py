"""Regenerate local text sidecars from immutable synthetic CV PDFs; not a runtime dependency."""
import hashlib
import json
import re
from pathlib import Path
from pypdf import PdfReader

root = Path(__file__).resolve().parent.parent
result = {}
for candidate, filename in {
    "candidate-anna": "anna-kowalska-cv-v1.pdf",
    "candidate-marek": "marek-nowak-cv-v1.pdf",
}.items():
    path = root / "public" / "cv" / filename
    full_text = "\n".join(page.extract_text() for page in PdfReader(path).pages)
    # Preserve section/bullet boundaries while joining PDF line wraps.
    lines = []
    for raw in full_text.splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("-") or line.isupper():
            lines.append(line)
        elif lines:
            lines[-1] += " " + line
        else:
            lines.append(line)
    text = "\n".join(lines)
    text = text[text.index("PROFIL ZAWODOWY"):]
    result[candidate] = {
        "file": filename,
        "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "text": text,
        "fullText": full_text,
    }
(root / "src/features/prototype/data/cv-text.json").write_text(
    json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)

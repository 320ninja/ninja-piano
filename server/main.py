from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
import tempfile, os, shutil, pathlib, subprocess

app = FastAPI(title="Piano Learners OMR")

# CORS: default to "*" (public demo server) but allow locking down via env.
# e.g. ALLOWED_ORIGINS="https://320ninja.github.io,https://ninja-piano.app"
_origins = os.environ.get("ALLOWED_ORIGINS", "*").strip()
ALLOWED_ORIGINS = ["*"] if _origins == "*" else [o.strip() for o in _origins.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

MAX_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_CT = {"application/pdf", "image/jpeg", "image/png"}
# Optional shared secret. If OMR_API_KEY is set, requests must send X-API-Key.
API_KEY = os.environ.get("OMR_API_KEY", "").strip()


@app.get("/")
def root():
    return {"status": "ok", "service": "Piano Learners OMR"}


@app.post("/scan")
async def scan(file: UploadFile = File(...), x_api_key: str = Header(default="")):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(401, "Invalid or missing API key")

    ct = (file.content_type or "").lower()
    if ct not in ALLOWED_CT:
        raise HTTPException(415, "Unsupported file type — send PDF, JPEG or PNG")
    ext = ".pdf" if "pdf" in ct else ".jpg" if "jpeg" in ct else ".png"

    # Stream-read with an early size cap so an oversized upload can't exhaust RAM.
    data = bytearray()
    while True:
        chunk = await file.read(1 << 20)  # 1 MB
        if not chunk:
            break
        data.extend(chunk)
        if len(data) > MAX_SIZE:
            raise HTTPException(413, "File too large — max 10 MB")

    src = out = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(data)
            src = tmp.name
        out = tempfile.mkdtemp()

        r = subprocess.run(
            ["python", "-m", "oemer", src, "--output-dir", out],
            capture_output=True, text=True, timeout=180,
        )
        xmls = list(pathlib.Path(out).glob("*.xml"))
        if not xmls:
            detail = r.stderr[-400:] if r.stderr else "No output produced"
            raise HTTPException(500, f"OMR failed: {detail}")
        return {"musicxml": xmls[0].read_text(encoding="utf-8")}
    except subprocess.TimeoutExpired:
        raise HTTPException(504, "Processing timed out — try a smaller or clearer image")
    finally:
        if src:
            try: os.unlink(src)
            except OSError: pass
        if out:
            shutil.rmtree(out, ignore_errors=True)

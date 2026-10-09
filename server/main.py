from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile, os, pathlib, subprocess

app = FastAPI(title="Ninja Piano OMR")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MAX_SIZE = 10 * 1024 * 1024  # 10 MB

@app.get("/")
def root():
    return {"status": "ok", "service": "Ninja Piano OMR"}

@app.post("/scan")
async def scan(file: UploadFile = File(...)):
    ct = file.content_type or ""
    ext = ".pdf" if "pdf" in ct else ".jpg" if "jpeg" in ct else ".png"

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(400, "File too large — max 10 MB")

    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
        tmp.write(data)
        src = tmp.name

    out = tempfile.mkdtemp()
    try:
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
        try: os.unlink(src)
        except: pass

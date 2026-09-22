# digital-literacy — Local Setup and Verification

This guide expands the [root README](README.md#quick-start). Use manual startup first; the supplied launchers retain development-era assumptions.

## Install and run

From the repository root, with Python 3.11+, Node.js 20+, and pnpm 9+ installed:

```bash
cp .env.example .env.local
cp backend/.env.example backend/.env
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```

Edit `backend/.env` before starting the API to supply `GEMINI_API_KEY`. For optional Cloud Vision OCR, set `GOOGLE_APPLICATION_CREDENTIALS` to an absolute credential-file path. See the [backend configuration guide](backend/API_SETUP_GUIDE.md).

In a second terminal:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open the Next.js URL, normally `http://localhost:3000`. The shared API client defaults to `http://localhost:8001`; root `.env.local` can set `NEXT_PUBLIC_API_URL`.

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
Copy-Item backend/.env.example backend/.env
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```

## Why the root-directory command matters

`backend/main.py` imports sibling helpers with relative imports. The package-qualified `backend.main:app` command supplies the required module context. Several existing batch scripts change into `backend/` and run `main:app`, which is inconsistent with those imports.

The dependency file now includes `fpdf2`, required by the active PDF helper imported during startup. The alternative WeasyPrint helper is not used by the registered PDF route and does not need to be installed for that route.

## Launcher status

| File | Current behavior / limitation |
| --- | --- |
| `START_HERE.bat` | Force-kills processes matching ports 3001/8001, starts backend via `main:app`, and opens port 3001 even though `npm run dev` does not explicitly select it. |
| `start_all.bat` | Uses Windows commands and the same backend module-path assumption. |
| `backend/start_backend.bat` | Assumes a local `venv` and starts `main:app`; use the root-directory command instead. |
| `backend/setup_backend.bat` | Windows setup script with working-directory assumptions; manual installation is easier to inspect. |
| `app.py` | Uses `cmd /c` and a `.bat` setup step, so it is not cross-platform. It launches the backend with the current Python interpreter. |
| `dashboard.html` | Standalone links/status page with hardcoded local URLs; it is not the Next.js dashboard route. |

Do not use the port-cleanup launcher while other applications need those ports. These scripts were retained for reference; their presence is not a guarantee of successful one-click startup.

## Verify in layers

1. Run `python -m pip check` and `python -m compileall -q backend` in the backend environment.
2. Start the API and inspect `/health`, `/docs`, and `/openapi.json`.
3. Check `/chat` with a configured provider and inspect `success` as well as the HTTP status.
4. Test a PDF with embedded text and an image separately; their extraction paths differ.
5. Review actual summary/PDF/audio content. Some endpoints return successful status with error text or empty/default content.
6. Run `pnpm exec tsc --noEmit` independently of `pnpm build`, because the Next.js configuration bypasses type and lint failures during builds.

Manual diagnostics in `backend/test_apis.py`, `backend/test_notebot.py`, and `test_ocr.py` may contact external services. They do not constitute a self-contained regression suite.

## Current integration constraints

- The image fallback can fail because of local `io` scoping.
- The browser sends form fields where image chat and summary PDF endpoints expect query parameters.
- `/ocr/pdf-report` is not registered on the final app instance.
- `/roadmap2/page.tsx` is empty.
- Root `NEXT_PUBLIC_API_URL` does not change the roadmap component's hardcoded localhost URL.
- Auth, dashboard progress, and learning-path modules are prototypes.

See the [root limitations](README.md#known-limitations) for the complete implementation boundary.

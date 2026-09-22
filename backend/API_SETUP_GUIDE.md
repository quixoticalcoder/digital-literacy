# digital-literacy — Backend Configuration

The backend uses Google Gemini for generation, optional Google Cloud Vision for image OCR, PyPDF2 for embedded PDF text, and gTTS for English audio.

## Environment

Copy `backend/.env.example` to `backend/.env` and edit:

```dotenv
GEMINI_API_KEY=your_gemini_api_key_here
# Optional Cloud Vision credentials:
# GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/vision-key.json
```

Use a real Gemini key for live generation. The current extraction route requires that key even when processing an embedded-text PDF or using Vision. Cloud Vision initialization also attempts application-default credential discovery; if initialization fails, the process continues with `vision_client=None`.

Keep credentials outside source control. The example file contains no usable secret. Never copy backend credentials into a `NEXT_PUBLIC_*` setting.

## Start the API

From the repository root in an activated Python environment:

```bash
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```

Use the package-qualified module path because the source has relative imports. The frontend runs separately, usually on port 3000.

## Configuration check

```bash
curl http://localhost:8001/health
```

`gemini_configured` checks whether a non-placeholder key string exists. `vision_available` checks the initialized client and an explicit credential-file path. These flags do not verify successful generation, billing/quota, model availability, or every valid default-credential scenario.

Inspect [Swagger UI](http://localhost:8001/docs) for the actual schema. In particular, `/chat/with-image` expects `message` as a query parameter and `/generate-pdf` expects query parameters, despite form-based calls in the frontend.

## Model selection

There is no configurable model environment variable. Most calls use `gemini-2.0-flash-thinking-exp` in `main.py`; roadmaps use `gemini-1.5-pro` in `roadmap_generator.py`. These are literal source settings, not verified current provider recommendations. Confirm availability and update source/configuration as needed for your account.

The roadmap request has no explicit HTTP timeout. Other generation helpers may return an error string instead of raising, so successful HTTP status is not sufficient to establish success.

## Data and output boundaries

- PDF extraction reads a text layer; it does not rasterize scanned PDFs for OCR.
- Image OCR tries Vision first, with a currently defective Gemini fallback path.
- Notes and uploaded content may be sent to Google services and printed in development logs.
- Summary PDF uses fpdf2 core fonts; full Unicode typography is not configured.
- Roadmap PDF expects a structured object or wraps a supplied Markdown string as description text.
- Speech output is English via gTTS and requires network connectivity.
- The backend has no accounts, authentication, persistence, rate limiting, or application-level upload-size control.

See the [root README](../README.md#api-reference) for all registered endpoints and [setup guide](../README_AI_SETUP.md) for platform-specific startup notes.

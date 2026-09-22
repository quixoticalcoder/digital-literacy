from fastapi import File, UploadFile
from fastapi import FastAPI
# Add dotenv import for load_dotenv
from dotenv import load_dotenv

# ...existing code...

from fastapi import Form
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

# ...existing code...

# Load environment variables
load_dotenv()

app = FastAPI(title="digital-literacy API", version="1.0.0")

@app.post("/ocr/pdf-report")
async def ocr_pdf_report(file: UploadFile = File(...), summary: str = Form("")):
    """
    Accepts a PDF file, extracts text, and returns a summary PDF using reportlab.
    Optionally, a summary string can be included in the report.
    """
    try:
        contents = await file.read()
        from PyPDF2 import PdfReader
        import io
        pdf_reader = PdfReader(io.BytesIO(contents))
        extracted_text = ""
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                extracted_text += page_text + "\n"
        if not extracted_text.strip():
            raise Exception("Could not extract text from the PDF. Please try a clearer file.")

        # Generate a new PDF report using reportlab
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        story.append(Paragraph(f"<b>PDF OCR Report</b>", styles['Title']))
        story.append(Spacer(1, 12))
        if summary:
            story.append(Paragraph(f"<b>Summary:</b> {summary}", styles['Normal']))
            story.append(Spacer(1, 12))
        story.append(Paragraph(f"<b>Extracted Text:</b>", styles['Heading2']))
        story.append(Paragraph(extracted_text.replace("\n", "<br/>"), styles['Normal']))
        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=ocr_report_{file.filename or 'output'}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF OCR report generation failed: {str(e)}")

from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
from google.cloud import vision
import os
from dotenv import load_dotenv
import base64
import io
from PIL import Image
import json
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from datetime import datetime
from gtts import gTTS
from PyPDF2 import PdfReader


from .pdf_generator_fpdf import generate_pdf_with_fpdf
from .roadmap_generator import generate_roadmap_with_gemini
from .roadmap_pdf import generate_roadmap_pdf



# ...existing code...

# Place this endpoint after app is defined

# (moved below, after app = FastAPI(...))
import tempfile
import re

# Load environment variables
load_dotenv()


app = FastAPI(title="digital-literacy API", version="1.0.0")

# Now define the /download-roadmap-pdf endpoint here
@app.post("/download-roadmap-pdf")
async def download_roadmap_pdf(request: Request):
    try:
        data = await request.json()
        topic = data.get("topic")
        roadmap = data.get("roadmap")
        if not topic:
            raise HTTPException(status_code=400, detail="Missing topic")
        if not roadmap:
            if not gemini_api_key:
                raise HTTPException(status_code=500, detail="Gemini API key not configured")
            roadmap = generate_roadmap_with_gemini(topic, gemini_api_key)

        # If roadmap is a string (Markdown), convert to a simple roadmap object
        if isinstance(roadmap, str):
            # Basic Markdown to object conversion (fallback)
            # This will just put the markdown in the description field
            roadmap_obj = {
                "title": topic,
                "description": roadmap,
                "phases": []
            }
        else:
            roadmap_obj = roadmap

        pdf_bytes = generate_roadmap_pdf(roadmap_obj)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=roadmap_{topic.replace(' ', '_')}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap PDF generation failed: {str(e)}")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002", "http://127.0.0.1:3003", "http://localhost:8001", "http://localhost:8002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini API
gemini_api_key = os.getenv("GEMINI_API_KEY")


# Roadmap generation endpoint
from fastapi.responses import JSONResponse

@app.post("/generate-roadmap")
async def generate_roadmap(request: Request):
    try:
        data = await request.json()
        topic = data.get("topic")
        if not topic:
            raise HTTPException(status_code=400, detail="Missing topic")
        if not gemini_api_key:
            raise HTTPException(status_code=500, detail="Gemini API key not configured")
        roadmap = generate_roadmap_with_gemini(topic, gemini_api_key)
        return JSONResponse(content={"roadmap": roadmap})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Roadmap generation failed: {str(e)}")
if gemini_api_key and gemini_api_key != "your_gemini_api_key_here":
    genai.configure(api_key=gemini_api_key)
    print(f"✅ Gemini API configured successfully")
else:
    print("⚠️  Gemini API key not found or invalid")

# Initialize Google Cloud Vision client
# Set the credentials path if provided
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
if credentials_path and os.path.exists(credentials_path):
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = credentials_path
    print(f"✅ Vision API credentials found at: {credentials_path}")

try:
    vision_client = vision.ImageAnnotatorClient()
except Exception as e:
    print(f"Warning: Could not initialize Vision API client: {e}")
    vision_client = None

# Pydantic models for request/response
class ChatRequest(BaseModel):
    message: str
    context: str = ""

class ChatResponse(BaseModel):
    response: str
    success: bool = True
    error: str = None

class OCRResponse(BaseModel):
    extracted_text: str
    success: bool = True
    error: str = None

class NotebotChatRequest(BaseModel):
    question: str
    notes_context: str

class AudioRequest(BaseModel):
    text: str

class EnhanceSummaryRequest(BaseModel):
    text: str

# Enhanced NoteBot Functions (moved here to be available for endpoints)
def correct_ocr_text(ocr_text):
    """Correct OCR errors and improve text quality"""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp')
        prompt = f"""
You are a smart AI assistant. The following text has been extracted using OCR and may contain errors such as misrecognized characters, punctuation issues, or broken words.

Your job is to correct the OCR errors and return clean, well-structured, readable content without changing the original meaning.

IMPORTANT: Remove any institution contact information, addresses, phone numbers, campus details, or administrative information. Focus only on the educational content.

Text to correct:
\"\"\"
{ocr_text}
\"\"\"

Return only the corrected version of the educational content, excluding any institutional contact details:
"""
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return ocr_text  # Return original if correction fails

def generate_structured_summary(text):
    """Generate a well-structured summary with headings and key points"""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp')
        prompt = f"""
Create a comprehensive, well-structured summary of the given content.

FORMATTING REQUIREMENTS:
- Start with a bold, large title using # for the main title
- Use proper markdown formatting:
  - ## for main sections
  - ### for subheadings (if needed)
- Use bullet points (-) for key concepts under each heading
- Make it study-friendly with clear organization
- Include all important information, formulas, definitions, and examples
- Structure must be: Title → Main Sections → Key Points under each section
- Do NOT include: institution names, contact numbers, addresses, campus information, or administrative details

EXAMPLE FORMAT:
# [Main Topic Title]

## Section 1: [Heading]
- Key point 1 with detailed explanation
- Key point 2 with examples or formulas  
- Key point 3 with important facts

## Section 2: [Heading]
- Key concept with context
- Additional details and examples

QUALITY REQUIREMENTS:
- Make headings descriptive and informative (not generic)
- Ensure each bullet point is substantial and educational
- Include practical examples and applications
- Create clear logical flow between sections
- Make it comprehensive for study purposes

CONTENT TO SUMMARIZE:
\"\"\"
{text}
\"\"\"

Generate the Markdown-formatted educational summary following the exact format above:
"""
        response = model.generate_content(prompt)
        
        # Get the result and ensure it's proper Markdown
        result = response.text.strip()
        print(f"🔍 Raw AI response: {result[:300]}...")
        
        # Ensure it starts with a proper heading
        if not result.startswith('#'):
            print("⚠️  AI didn't start with proper heading, adding fallback...")
            lines = result.split('\n')
            if lines and lines[0].strip():
                # Make first line the main heading
                title = lines[0].strip().rstrip(':')
                result = f"# {title}\n\n" + '\n'.join(lines[1:])
        
        print(f"📊 Final Markdown result preview: {result[:200]}...")
        return result
    except Exception as e:
        return f"Error generating summary: {e}"

def notebot_chat(question, notes_context):
    """NoteBot contextual chat function"""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp')
        prompt = f"""
You are NoteBot, an assistant who only answers questions based on the following notes.

If a question is out of scope (not related to the notes), politely respond:
"I'm NoteBot, designed to assist only with the uploaded notes. Please ask questions related to your notes."

Notes:
\"\"\"
{notes_context}
\"\"\"

Question:
{question}

Answer:
"""
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error: {e}"

def make_text_speech_friendly(summary_text):
    """Convert summary to speech-friendly format"""
    try:
        model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp')
        prompt = f"""
You are a voice assistant preparing a summary for spoken output.
Don't speak unnecessary things like "of course, here is the summary" or something like that.
Start with speaking "Here is the summary of [topic name]" and then start speaking the summary (without any additional commentary).
Don't sound robotic or like a computer.
User should feel like they are listening to a human voice.

The following text is an AI-generated summary of notes. Please rewrite it in a way that sounds natural when spoken aloud by a voice AI.

- Remove or rephrase markdown symbols like **, #, etc.
- Reword or skip any mathematical expressions like asterisk (*), slash (/), plus (+), or minus (-) so they don't sound robotic.
- Ensure everything is easy to listen to and sounds like natural spoken English.

Summary:
\"\"\"
{summary_text}
\"\"\"

Speak-friendly version:
"""
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return summary_text  # Return original if conversion fails

@app.get("/")
async def root():
    return {"message": "digital-literacy API is running"}

@app.get("/health")
async def health_check():
    gemini_key = os.getenv("GEMINI_API_KEY")
    credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    return {
        "status": "healthy",
        "gemini_configured": bool(gemini_key and gemini_key != "your_gemini_api_key_here"),
        "vision_available": vision_client is not None and bool(credentials_path and os.path.exists(credentials_path))
    }

@app.post("/chat", response_model=ChatResponse)
async def chat_with_gemini(request: ChatRequest):
    """
    Chat endpoint using Google Gemini API
    """
    try:
        # Initialize Gemini model - Latest thinking model for enhanced reasoning
        model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp')
        
        # Prepare the prompt with context if provided
        prompt = request.message
        if request.context:
            prompt = f"Context: {request.context}\n\nUser: {request.message}"
        
        # Generate response
        response = model.generate_content(prompt)
        
        return ChatResponse(
            response=response.text,
            success=True
        )
    
    except Exception as e:
        return ChatResponse(
            response="",
            success=False,
            error=str(e)
        )

@app.post("/ocr/extract", response_model=OCRResponse)
async def extract_text_from_image(file: UploadFile = File(...)):
    """
    OCR endpoint using Gemini Vision API as fallback
    """
    try:
        # Check if Gemini API is available
        if not gemini_api_key or gemini_api_key == "your_gemini_api_key_here":
            raise HTTPException(status_code=500, detail="Gemini API not configured")

        # Read the uploaded file
        contents = await file.read()


        # Robust file type detection
        filename = file.filename.lower() if file.filename else ""
        is_pdf = False
        is_image = False
        # Check for PDF by extension or magic bytes
        if filename.endswith(".pdf") or contents[:5] == b'%PDF-':
            is_pdf = True
        # Check for common image signatures (PNG, JPEG, etc.)
        elif contents[:4] == b'\x89PNG' or contents[:2] == b'\xff\xd8':
            is_image = True

        if is_pdf:
            # PDF extraction using PyPDF2
            try:
                from PyPDF2 import PdfReader
                import io
                pdf_reader = PdfReader(io.BytesIO(contents))
                extracted_text = ""
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        extracted_text += page_text + "\n"
                if not extracted_text.strip():
                    raise Exception("Could not extract text from the PDF. Please try a clearer file.")
                return OCRResponse(
                    extracted_text=extracted_text.strip(),
                    success=True
                )
            except Exception as pdf_error:
                return OCRResponse(
                    extracted_text="",
                    success=False,
                    error=f"PDF extraction error: {pdf_error}"
                )

        elif is_image:
            # Try Google Cloud Vision API first if available
            if vision_client:
                try:
                    image = vision.Image(content=contents)
                    response = vision_client.text_detection(image=image)
                    texts = response.text_annotations
                    if texts:
                        extracted_text = texts[0].description
                        if response.error.message:
                            raise Exception(response.error.message)
                        return OCRResponse(
                            extracted_text=extracted_text,
                            success=True
                        )
                except Exception as vision_error:
                    print(f"Vision API failed, falling back to Gemini: {vision_error}")

            # Fallback to Gemini Vision API
            print("Using Gemini Vision API for OCR...")
            try:
                image_pil = Image.open(io.BytesIO(contents))
            except Exception as pil_error:
                return OCRResponse(
                    extracted_text="",
                    success=False,
                    error=f"Image extraction error: {pil_error}"
                )
            model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp')
            prompt = """
            Please extract ALL text from this image. Be very thorough and accurate:

            1. Read every single word, number, symbol, and equation visible in the image
            2. Preserve the original formatting and structure as much as possible
            3. Include mathematical equations, formulas, and special symbols
            4. Maintain line breaks and spacing where appropriate
            5. If there are tables, preserve their structure
            6. Include any handwritten text if present
            7. Don't add any commentary or explanations - just extract the text

            Return only the extracted text without any additional formatting or commentary.
            """
            response = model.generate_content([prompt, image_pil])
            extracted_text = response.text.strip()
            return OCRResponse(
                extracted_text=extracted_text,
                success=True
            )
        else:
            # Not a supported file type
            return OCRResponse(
                extracted_text="",
                success=False,
                error="Unsupported file type. Please upload a PDF or image file."
            )

    except Exception as e:
        return OCRResponse(
            extracted_text="",
            success=False,
            error=str(e)
        )

@app.post("/chat/with-image")
async def chat_with_image(
    message: str,
    file: UploadFile = File(...)
):
    """
    Chat with Gemini using both text and image
    """
    try:
        # Read the uploaded file
        contents = await file.read()
        
        # Convert to PIL Image
        image = Image.open(io.BytesIO(contents))
        
        # Initialize Gemini Vision model - Latest thinking model for enhanced reasoning
        model = genai.GenerativeModel('gemini-2.0-flash-thinking-exp')
        
        # Generate response with image and text
        response = model.generate_content([message, image])
        
        return {
            "response": response.text,
            "success": True
        }
    
    except Exception as e:
        return {
            "response": "",
            "success": False,
            "error": str(e)
        }

@app.post("/generate-pdf")
async def generate_summary_pdf(
    title: str = "Document Summary",
    extracted_text: str = "",
    summary: str = "",
    questions: str = ""
):
    """
    Generate a well-structured PDF report using weasyprint for better HTML to PDF conversion
    """
    try:
        # Debug logging
        print(f"📋 PDF Generation Request:")
        print(f"   Title: {title}")
        print(f"   Extracted Text Length: {len(extracted_text)}")
        print(f"   Summary Length: {len(summary)}")
        print(f"   Questions Length: {len(questions)}")
        print(f"   Extracted Text Preview: {extracted_text[:200] if extracted_text else 'None'}...")
        print(f"   Summary Preview: {summary[:200] if summary else 'None'}...")
        # Ensure all fields are strings (never files or images)
        for field_name, value in [("title", title), ("extracted_text", extracted_text), ("summary", summary), ("questions", questions)]:
            if not isinstance(value, str):
                print(f"[WARN] Field {field_name} is not a string. Forcing to string.")
                locals()[field_name] = str(value)

        print("🔄 Generating PDF with fpdf2...")

        # Defensive: never try to open images, only process as text
        try:
            pdf_bytes = generate_pdf_with_fpdf(title, extracted_text, summary, questions)
        except Exception as pdf_error:
            print(f"❌ PDF generation failed in fpdf2: {pdf_error}")
            raise HTTPException(status_code=500, detail=f"PDF generation failed: {pdf_error}")

        print(f"✅ PDF generated successfully - Size: {len(pdf_bytes)} bytes")

        # Return the PDF as a streaming response
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=summary_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            }
        )

    except Exception as e:
        print(f"❌ PDF generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

@app.post("/notebot/chat")
async def notebot_chat_endpoint(request: NotebotChatRequest):
    """
    Chat with NoteBot using context from uploaded notes
    """
    try:
        response = notebot_chat(request.question, request.notes_context)
        return {
            "response": response,
            "success": True
        }
    except Exception as e:
        return {
            "response": "I'm sorry, I encountered an error. Please try again.",
            "success": False,
            "error": str(e)
        }

@app.post("/text-to-speech")
async def text_to_speech(request: AudioRequest):
    """
    Convert summary text to speech audio
    """
    try:
        # Make text speech-friendly
        speech_friendly_text = make_text_speech_friendly(request.text)
        
        # Generate speech
        tts = gTTS(speech_friendly_text, lang='en')
        mp3_buffer = io.BytesIO()
        tts.write_to_fp(mp3_buffer)
        mp3_buffer.seek(0)
        
        return StreamingResponse(
            mp3_buffer,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=summary_audio.mp3"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio generation failed: {str(e)}")

class EnhanceSummaryRequest(BaseModel):
    text: str

@app.post("/enhance-summary")
async def enhance_summary(request: EnhanceSummaryRequest):
    """
    Enhance extracted text with proper structure and formatting
    """
    try:
        print(f"📝 Received enhance-summary request with text length: {len(request.text)}")
        
        # First correct OCR errors
        corrected_text = correct_ocr_text(request.text)
        print(f"✅ OCR correction completed, length: {len(corrected_text)}")
        
        # Then generate structured summary
        structured_summary = generate_structured_summary(corrected_text)
        print(f"📊 Structured summary generated, length: {len(structured_summary)}")
        print(f"📊 Summary preview: {structured_summary[:100]}...")
        
        result = {
            "corrected_text": corrected_text,
            "structured_summary": structured_summary,
            "success": True
        }
        print(f"🚀 Returning result with success: {result['success']}")
        return result
    except Exception as e:
        print(f"❌ Error in enhance-summary: {str(e)}")
        return {
            "corrected_text": request.text,
            "structured_summary": request.text,
            "success": False,
            "error": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=os.getenv("HOST", "localhost"), 
        port=int(os.getenv("PORT", 8001))
    )

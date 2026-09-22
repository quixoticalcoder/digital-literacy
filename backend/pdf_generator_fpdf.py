import re
from fpdf import FPDF
from datetime import datetime

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'Document Summary', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def clean_text_for_pdf(text):
    """Clean text to remove HTML tags and handle special characters"""
    if not text:
        return ""
    
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # Handle common HTML entities
    html_entities = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&nbsp;': ' ',
        '&quot;': '"',
        '&#39;': "'",
        '&hellip;': '...'
    }
    
    for entity, replacement in html_entities.items():
        text = text.replace(entity, replacement)
    
    # Handle markdown formatting
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # Bold
    text = re.sub(r'\*(.*?)\*', r'\1', text)      # Italic
    text = re.sub(r'`(.*?)`', r'\1', text)        # Code
    
    # Clean up multiple spaces and newlines
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    
    return text

def format_mathematical_expressions(text):
    """Format mathematical expressions for better PDF display"""
    if not text:
        return ""
    
    # Mathematical patterns to make bold
    math_patterns = [
        r'([a-zA-Z])\s*=\s*([^,\s]+)',  # Variables and equations
        r'f\([^)]+\)',                  # Functions
        r'∫[^d]*d[a-zA-Z]',            # Integrals
        r'∑[^=]*=',                     # Summations
        r'lim[^→]*→',                   # Limits
        r'√[^,\s]+',                    # Square roots
        r'[a-zA-Z]+\^[0-9]+',          # Exponents
        r'[0-9]+\.[0-9]+',             # Decimals
        r'[a-zA-Z]+\([^)]*\)',         # Function calls
        r'[A-Z]+[a-z]*\s*=\s*[^,\s]+', # Chemical equations
    ]
    
    for pattern in math_patterns:
        text = re.sub(pattern, lambda m: f"**{m.group()}**", text)
    
    return text

def add_formatted_text(pdf, text, font_size=11):
    """Add formatted text with support for bold and line breaks"""
    if not text:
        return
    
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            pdf.ln(5)
            continue
        
        # Check if line is a header (starts with #)
        if line.startswith('#'):
            header_level = len(line) - len(line.lstrip('#'))
            header_text = line.lstrip('# ').strip()
            
            if header_level == 1:
                pdf.ln(5)
                pdf.set_font('Arial', 'B', 14)
                pdf.cell(0, 8, header_text, 0, 1, 'L')
                pdf.ln(3)
            elif header_level == 2:
                pdf.ln(3)
                pdf.set_font('Arial', 'B', 12)
                pdf.cell(0, 7, header_text, 0, 1, 'L')
                pdf.ln(2)
            else:
                pdf.ln(2)
                pdf.set_font('Arial', 'B', 11)
                pdf.cell(0, 6, header_text, 0, 1, 'L')
                pdf.ln(1)
            continue
        
        # Check if line is a bullet point
        if line.startswith('-') or line.startswith('*'):
            bullet_text = line.lstrip('- *').strip()
            pdf.set_font('Arial', '', font_size)
            pdf.cell(10, 6, '•', 0, 0, 'L')
            
            # Handle text with potential bold formatting
            parts = re.split(r'(\*\*[^*]+\*\*)', bullet_text)
            x_start = pdf.get_x()
            
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    # Bold text
                    bold_text = part[2:-2]
                    pdf.set_font('Arial', 'B', font_size)
                    pdf.cell(pdf.get_string_width(bold_text), 6, bold_text, 0, 0, 'L')
                elif part:
                    # Regular text
                    pdf.set_font('Arial', '', font_size)
                    pdf.cell(pdf.get_string_width(part), 6, part, 0, 0, 'L')
            
            pdf.ln(6)
            continue
        
        # Regular paragraph text
        pdf.set_font('Arial', '', font_size)
        
        # Handle text with potential bold formatting
        parts = re.split(r'(\*\*[^*]+\*\*)', line)
        
        for i, part in enumerate(parts):
            if part.startswith('**') and part.endswith('**'):
                # Bold text
                bold_text = part[2:-2]
                pdf.set_font('Arial', 'B', font_size)
                pdf.cell(pdf.get_string_width(bold_text), 6, bold_text, 0, 0, 'L')
            elif part:
                # Regular text
                pdf.set_font('Arial', '', font_size)
                
                # Split long lines
                words = part.split(' ')
                current_line = ""
                
                for word in words:
                    test_line = current_line + (" " if current_line else "") + word
                    if pdf.get_string_width(test_line) > 180:  # Max width
                        if current_line:
                            pdf.cell(pdf.get_string_width(current_line), 6, current_line, 0, 0, 'L')
                            pdf.ln(6)
                            current_line = word
                        else:
                            pdf.cell(pdf.get_string_width(word), 6, word, 0, 0, 'L')
                            pdf.ln(6)
                    else:
                        current_line = test_line
                
                if current_line:
                    pdf.cell(pdf.get_string_width(current_line), 6, current_line, 0, 0, 'L')
        
        pdf.ln(6)

def generate_pdf_with_fpdf(title, extracted_text, summary, questions):
    """Generate PDF using fpdf2 library"""
    
    print(f"📋 PDF Generation (fpdf2):")
    print(f"   Title: {title}")
    print(f"   Extracted Text Length: {len(extracted_text) if extracted_text else 0}")
    print(f"   Summary Length: {len(summary) if summary else 0}")
    print(f"   Questions Length: {len(questions) if questions else 0}")
    
    # Create PDF
    pdf = PDF()
    pdf.add_page()
    
    # Add timestamp
    timestamp = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    pdf.set_font('Arial', 'I', 10)
    pdf.cell(0, 5, f"Generated on: {timestamp}", 0, 1, 'C')
    pdf.ln(10)
    
    # Add Extracted Text section
    if extracted_text and extracted_text.strip():
        cleaned_text = clean_text_for_pdf(extracted_text)
        formatted_text = format_mathematical_expressions(cleaned_text)
        
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'Extracted Text', 0, 1, 'L')
        pdf.ln(5)
        
        add_formatted_text(pdf, formatted_text, 10)
        pdf.ln(10)
    else:
        print("⚠️ No extracted text provided or empty")
    
    # Add Summary section
    if summary and summary.strip():
        cleaned_summary = clean_text_for_pdf(summary)
        formatted_summary = format_mathematical_expressions(cleaned_summary)
        
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'Summary', 0, 1, 'L')
        pdf.ln(5)
        
        add_formatted_text(pdf, formatted_summary, 11)
        pdf.ln(10)
    else:
        print("⚠️ No summary provided or empty")
    
    # Add Questions section
    if questions and questions.strip():
        cleaned_questions = clean_text_for_pdf(questions)
        formatted_questions = format_mathematical_expressions(cleaned_questions)
        
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 8, 'Questions', 0, 1, 'L')
        pdf.ln(5)
        
        add_formatted_text(pdf, formatted_questions, 11)
    else:
        print("⚠️ No questions provided or empty")
    
    # Generate PDF bytes
    pdf_bytes = pdf.output(dest='S')
    
    print(f"✅ PDF generated successfully, size: {len(pdf_bytes)} bytes")
    
    return pdf_bytes

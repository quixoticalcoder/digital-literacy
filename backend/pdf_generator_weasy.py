from weasyprint import HTML, CSS
import io
import re
from datetime import datetime

def generate_pdf_with_weasyprint(title, extracted_text, summary, questions):
    """
    Generate a well-structured PDF report using weasyprint for better HTML to PDF conversion
    """
    # Clean and prepare content
    def clean_content(content):
        if not content:
            return ""
        # Remove problematic characters and normalize text
        cleaned = content.replace('\r\n', '\n').replace('\r', '\n')
        # Replace multiple newlines with single ones
        cleaned = re.sub(r'\n\s*\n', '\n\n', cleaned)
        # Replace tabs with spaces
        cleaned = cleaned.replace('\t', '    ')
        return cleaned.strip()

    # Clean all inputs
    clean_title = clean_content(title) or "Document Summary"
    clean_extracted_text = clean_content(extracted_text)
    clean_summary = clean_content(summary)
    clean_questions = clean_content(questions)
    
    # Generate current date
    current_date = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    
    # Mathematical expression patterns for formatting
    math_patterns = [
        (r'\b([a-zA-Z0-9\s\+\-\*\/\^\(\)\.]+\s*[=≤≥<>≠≈≅∝≡]\s*[a-zA-Z0-9\s\+\-\*\/\^\(\)\.]+)\b', r'<strong>\1</strong>'),
        (r'\b(sin|cos|tan|cot|sec|csc|sinh|cosh|tanh|asin|acos|atan|log|ln|lg|exp|sqrt|cbrt|abs|floor|ceil|round|min|max|det|trace|rank|dim|lim|sup|inf)\s*\([^)]+\)', r'<strong>\1</strong>'),
        (r'\b([a-zA-Z0-9\(\)\[\]_{}\^\+\-\*]+)\/([a-zA-Z0-9\(\)\[\]_{}\^\+\-\*]+)\b', r'<strong>\1/\2</strong>'),
        (r'\b([a-zA-Z0-9\(\)]+)[\^]([a-zA-Z0-9\+\-\*\/]+)\b', r'<strong>\1<sup>\2</sup></strong>'),
        (r'([π∞αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ√∛∜∑∏∫∬∭∮∯∰∇∂∆∴∵∀∃∈∉⊂⊃⊆⊇∩∪∅ℝℂℕℤℚ℘ℵ≈≅≡≠≤≥⊥∥⟂∠∡∢°′″‰‱%])', r'<strong>\1</strong>'),
        (r'\b([0-9]+\.?\d*\s*[+\-×÷*/÷]\s*[0-9]+\.?\d*(?:\s*[+\-×÷*/÷]\s*[0-9]+\.?\d*)*)\b', r'<strong>\1</strong>'),
    ]
    
    # Create HTML content with better styling
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{clean_title}</title>
        <style>
            @page {{
                size: A4;
                margin: 2cm;
                @bottom-center {{
                    content: "Page " counter(page) " of " counter(pages);
                    font-size: 10pt;
                    color: #666;
                }}
            }}
            
            body {{
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                font-size: 11pt;
            }}
            
            .header {{
                text-align: center;
                margin-bottom: 40px;
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
            }}
            
            .header h1 {{
                color: #2563eb;
                font-size: 24pt;
                margin: 0 0 10px 0;
                font-weight: 700;
            }}
            
            .generated-date {{
                color: #666;
                font-size: 10pt;
                margin: 10px 0;
            }}
            
            .section {{
                margin-bottom: 30px;
                page-break-inside: avoid;
            }}
            
            .section-title {{
                color: #1d4ed8;
                font-size: 16pt;
                font-weight: 600;
                margin: 0 0 15px 0;
                padding: 10px 0 5px 0;
                border-bottom: 2px solid #e5e7eb;
            }}
            
            .content {{
                font-size: 11pt;
                line-height: 1.7;
                text-align: justify;
            }}
            
            .content p {{
                margin: 0 0 12px 0;
            }}
            
            .math-expression {{
                font-weight: bold;
                color: #1f2937;
            }}
            
            .question {{
                margin-bottom: 15px;
            }}
            
            .question-number {{
                font-weight: bold;
                color: #2563eb;
            }}
            
            .answer {{
                margin-left: 20px;
                margin-top: 5px;
            }}
            
            .no-content {{
                color: #ef4444;
                font-style: italic;
                text-align: center;
                padding: 20px;
                background-color: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 6px;
            }}
            
            /* Mathematical expressions styling */
            strong {{
                font-weight: 600;
                color: #1f2937;
            }}
            
            sup {{
                font-size: 8pt;
            }}
            
            sub {{
                font-size: 8pt;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>{clean_title}</h1>
            <div class="generated-date">Generated on: {current_date}</div>
        </div>
    """
    
    # Add extracted text section
    if clean_extracted_text:
        # Escape HTML and convert newlines to <br> tags
        formatted_text = clean_extracted_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        formatted_text = formatted_text.replace('\n', '<br>')
        
        # Apply mathematical expression formatting
        for pattern, replacement in math_patterns:
            formatted_text = re.sub(pattern, replacement, formatted_text)
        
        html_content += f"""
        <div class="section">
            <h2 class="section-title">📄 Extracted Text</h2>
            <div class="content">
                <p>{formatted_text}</p>
            </div>
        </div>
        """
    
    # Add summary section
    if clean_summary:
        # Process summary content
        formatted_summary = clean_summary.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        formatted_summary = formatted_summary.replace('\n', '<br>')
        
        # Apply mathematical formatting to summary as well
        for pattern, replacement in math_patterns:
            formatted_summary = re.sub(pattern, replacement, formatted_summary)
        
        html_content += f"""
        <div class="section">
            <h2 class="section-title">📋 Enhanced Summary</h2>
            <div class="content">
                <p>{formatted_summary}</p>
            </div>
        </div>
        """
    
    # Add questions section
    if clean_questions:
        # Parse and format questions
        formatted_questions = clean_questions.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
        
        # Split into lines and format Q&A
        lines = formatted_questions.split('\n')
        questions_html = ""
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if line starts with a number (question)
            if re.match(r'^\d+\.', line):
                questions_html += f'<div class="question"><span class="question-number">{line}</span></div>'
            elif line.lower().startswith('answer:'):
                questions_html += f'<div class="answer">{line}</div>'
            else:
                questions_html += f'<p>{line}</p>'
        
        html_content += f"""
        <div class="section">
            <h2 class="section-title">❓ Generated Questions</h2>
            <div class="content">
                {questions_html}
            </div>
        </div>
        """
    
    # Add fallback if no content
    if not any([clean_extracted_text, clean_summary, clean_questions]):
        html_content += """
        <div class="section">
            <div class="no-content">
                <h3>⚠️ No content available for PDF generation</h3>
                <p>Please ensure that the document processing is complete before downloading the PDF.</p>
            </div>
        </div>
        """
    
    # Close HTML
    html_content += """
    </body>
    </html>
    """
    
    # Generate PDF using weasyprint
    pdf_buffer = io.BytesIO()
    
    # Create HTML object and generate PDF
    html_doc = HTML(string=html_content)
    html_doc.write_pdf(pdf_buffer)
    
    # Get PDF bytes
    pdf_buffer.seek(0)
    pdf_bytes = pdf_buffer.getvalue()
    pdf_buffer.close()
    
    return pdf_bytes

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
import io

# Accepts a roadmap dict (same as returned by generate_roadmap_with_gemini)
def generate_roadmap_pdf(roadmap: dict) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    story.append(Paragraph(f"<b>{roadmap.get('title', 'Learning Roadmap')}</b>", styles['Title']))
    story.append(Spacer(1, 0.2 * inch))
    # Description
    story.append(Paragraph(roadmap.get('description', ''), styles['Normal']))
    story.append(Spacer(1, 0.2 * inch))

    for phase in roadmap.get('phases', []):
        story.append(Paragraph(f"<b>Phase {phase.get('phase', '')}: {phase.get('title', '')}</b>", styles['Heading2']))
        story.append(Paragraph(f"Duration: {phase.get('duration', '')}", styles['Normal']))
        story.append(Paragraph(f"Objectives: {', '.join(phase.get('objectives', []))}", styles['Normal']))
        story.append(Paragraph(f"Topics: {', '.join(phase.get('topics', []))}", styles['Normal']))
        # Resources
        resources = phase.get('resources', [])
        if resources:
            res_lines = []
            for res in resources:
                res_lines.append(f"[{res.get('type', '')}] {res.get('title', '')}: {res.get('url', '')}")
            story.append(Paragraph("Resources:", styles['Normal']))
            for line in res_lines:
                story.append(Paragraph(line, styles['Bullet']))
        # Projects
        projects = phase.get('projects', [])
        if projects:
            story.append(Paragraph(f"Projects: {', '.join(projects)}", styles['Normal']))
        story.append(Spacer(1, 0.2 * inch))
        story.append(PageBreak())

    doc.build(story)
    pdf = buffer.getvalue()
    buffer.close()
    return pdf

import os
import requests
from fastapi import HTTPException

def generate_roadmap_with_gemini(topic: str, gemini_api_key: str) -> dict:
    url = f"https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key={gemini_api_key}"
    prompt = f'''
Create a comprehensive, well-structured learning roadmap for the topic: {topic}

FORMATTING REQUIREMENTS:
- Start with a bold, large title using # for the main title (e.g., # Learning Roadmap for {topic})
- Use proper markdown formatting:
  - ## for each phase or main section
  - ### for subheadings (Objectives, Topics, Resources, Projects)
  - Use bullet points (-) for key concepts under each heading
- Make it study-friendly with clear organization
- Include all important information, formulas, definitions, code, and examples
- Structure must be: Title → Phases/Sections → Key Points under each section
- Do NOT include: institution names, contact numbers, addresses, or administrative details

EXAMPLE FORMAT:
# Learning Roadmap for {topic}

## Phase 1: Foundations (2-3 weeks)
### Objectives
- Key point 1 with detailed explanation
- Key point 2 with examples or formulas
### Topics
- Key topic 1
- Key topic 2
### Resources
- [YouTube: Intro to {topic}](https://youtube.com/...) - Short description
### Projects
- Project idea 1
- Project idea 2

## Phase 2: [Next Phase Title] (duration)
### Objectives
- ...
### Topics
- ...
### Resources
- ...
### Projects
- ...

QUALITY REQUIREMENTS:
- Make headings and bullet points descriptive and informative (not generic)
- Ensure each bullet point is substantial and educational
- Include practical examples and applications
- Create clear logical flow between sections
- Make it comprehensive and actionable for self-learners

Return ONLY the markdown-formatted roadmap, no extra commentary or JSON.
    '''
    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }
    response = requests.post(url, json=payload, headers={"Content-Type": "application/json"})
    if not response.ok:
        try:
            error_detail = response.json()
        except Exception:
            error_detail = response.text
        print(f"Gemini API error: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to generate roadmap from Gemini API: {error_detail}")
    # Return markdown roadmap directly
    try:
        content = response.json()
        text = content["candidates"][0]["content"]["parts"][0]["text"]
        return {"markdown": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing Gemini response: {str(e)}")

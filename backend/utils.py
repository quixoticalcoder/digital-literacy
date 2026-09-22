"""
Utility functions for the backend
"""
import base64
import io
from PIL import Image
from typing import Optional

def encode_image_to_base64(image_path: str) -> str:
    """
    Encode an image file to base64 string
    """
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def decode_base64_to_image(base64_string: str) -> Image.Image:
    """
    Decode a base64 string to PIL Image
    """
    image_data = base64.b64decode(base64_string)
    return Image.open(io.BytesIO(image_data))

def validate_image_file(filename: str) -> bool:
    """
    Validate if the file is a supported image format
    """
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}
    return any(filename.lower().endswith(ext) for ext in allowed_extensions)

def format_chat_response(text: str, max_length: Optional[int] = None) -> str:
    """
    Format and clean the chat response
    """
    # Remove any unwanted characters or formatting
    cleaned_text = text.strip()
    
    if max_length and len(cleaned_text) > max_length:
        cleaned_text = cleaned_text[:max_length] + "..."
    
    return cleaned_text

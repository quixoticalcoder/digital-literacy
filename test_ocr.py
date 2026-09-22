import requests
import base64
from PIL import Image, ImageDraw, ImageFont
import io

# Create a simple test image with text
def create_test_image():
    # Create a white image
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)
    
    # Add some text
    try:
        font = ImageFont.truetype("arial.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    text = "Hello, this is a test image for OCR.\nThis should be extracted by the API."
    draw.text((10, 50), text, fill='black', font=font)
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

# Test the OCR endpoint
def test_ocr_endpoint():
    try:
        # Create test image
        test_image = create_test_image()
        
        # Prepare the request
        files = {'file': ('test.png', test_image, 'image/png')}
        
        print("Testing OCR endpoint...")
        response = requests.post('http://localhost:8001/ocr/extract', files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ OCR API is working!")
                print(f"Extracted text: {result.get('extracted_text', 'No text found')}")
            else:
                print("❌ OCR API returned error:")
                print(f"Error: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Make sure it's running on localhost:8001")
    except Exception as e:
        print(f"❌ Error testing OCR: {str(e)}")

if __name__ == "__main__":
    test_ocr_endpoint()

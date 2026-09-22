import requests
import io
from PIL import Image, ImageDraw, ImageFont

def create_test_image():
    """Create a simple test image with text"""
    # Create a white image
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)
    
    # Add some text
    text = "Hello World!\nThis is a test for OCR.\nDigital literacy is important."
    try:
        # Try to use a default font
        font = ImageFont.load_default()
    except:
        font = None
    
    draw.text((20, 50), text, fill='black', font=font)
    
    # Save to bytes
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    return img_bytes

def test_ocr_endpoint():
    """Test the OCR endpoint"""
    print("🔍 Testing OCR endpoint...")
    
    # Create test image
    test_image = create_test_image()
    
    try:
        # Test OCR endpoint
        files = {'file': ('test.png', test_image, 'image/png')}
        response = requests.post('http://localhost:8001/ocr/extract', files=files)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ OCR successful!")
                print(f"Extracted text: {data.get('extracted_text', '')}")
            else:
                print(f"❌ OCR failed: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ OCR test failed: {e}")

def test_chat_endpoint():
    """Test the chat endpoint"""
    print("\n🤖 Testing chat endpoint...")
    
    try:
        payload = {
            "message": "Create a summary of this text: Digital literacy helps people use technology effectively.",
            "context": "Educational content summarization"
        }
        response = requests.post('http://localhost:8001/chat', json=payload)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"✅ Chat successful!")
                print(f"Response: {data.get('response', '')[:100]}...")
            else:
                print(f"❌ Chat failed: {data.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Chat test failed: {e}")

if __name__ == "__main__":
    print("🧪 Testing Notebot Backend Endpoints")
    print("=" * 50)
    
    test_ocr_endpoint()
    test_chat_endpoint()
    
    print("\n" + "=" * 50)
    print("✅ Tests completed!")

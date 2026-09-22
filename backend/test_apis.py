import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Test configuration
BACKEND_URL = "http://localhost:8001"

def test_health():
    """Test the health endpoint"""
    print("🔍 Testing backend health...")
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        data = response.json()
        print(f"✅ Health check: {data}")
        return data
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return None

def test_chat():
    """Test the chat endpoint"""
    print("\n🤖 Testing Gemini chat...")
    try:
        payload = {
            "message": "Hello! Can you help me learn about digital literacy?",
            "context": "You are a helpful AI tutor for rural education."
        }
        response = requests.post(f"{BACKEND_URL}/chat", json=payload)
        data = response.json()
        if data.get("success"):
            print(f"✅ Chat test successful!")
            print(f"Response: {data.get('response', '')[:100]}...")
        else:
            print(f"❌ Chat test failed: {data.get('error', 'Unknown error')}")
        return data
    except Exception as e:
        print(f"❌ Chat test failed: {e}")
        return None

def main():
    print("🚀 Starting API Tests...")
    print("=" * 50)
    
    # Test health
    health = test_health()
    
    if health and health.get("status") == "healthy":
        print("\n✅ Backend is healthy!")
        
        if health.get("gemini_configured"):
            print("✅ Gemini API is configured")
            test_chat()
        else:
            print("⚠️  Gemini API not configured")
            
        if health.get("vision_available"):
            print("✅ Vision API is available")
        else:
            print("⚠️  Vision API not available")
    else:
        print("❌ Backend is not healthy")
    
    print("\n" + "=" * 50)
    print("🎉 Test completed!")

if __name__ == "__main__":
    main()

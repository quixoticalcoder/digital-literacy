/**
 * API client for communicating with the Python backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  success: boolean;
  error?: string;
}

export interface OCRResponse {
  extracted_text: string;
  success: boolean;
  error?: string;
}

export interface HealthResponse {
  status: string;
  gemini_configured: boolean;
  vision_available: boolean;
}

export interface NotebotChatRequest {
  question: string;
  notes_context: string;
}

export interface AudioRequest {
  text: string;
}

export interface AudioResponse {
  audio_url: string;
  success: boolean;
  error?: string;
}

export interface EnhanceSummaryResponse {
  corrected_text: string;
  structured_summary: string;
  success: boolean;
  error?: string;
}

class BackendAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if the backend is healthy and properly configured
   */
  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Send a chat message to Gemini AI
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat API error:', error);
      return {
        response: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Extract text from an image using OCR
   */
  async extractTextFromImage(file: File): Promise<OCRResponse> {
    console.log("🌐 backendAPI.extractTextFromImage called with file:", file.name, file.type, file.size)
    try {
      const formData = new FormData();
      formData.append('file', file);
      console.log("📤 Sending request to:", `${this.baseUrl}/ocr/extract`)

      const response = await fetch(`${this.baseUrl}/ocr/extract`, {
        method: 'POST',
        body: formData,
      });

      console.log("📥 Response status:", response.status, response.statusText)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("📋 Response JSON:", result)
      return result;
    } catch (error) {
      console.error('❌ OCR API error:', error);
      return {
        extracted_text: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Chat with Gemini using both text and image
   */
  async chatWithImage(message: string, file: File): Promise<ChatResponse> {
    try {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/chat/with-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Chat with image API error:', error);
      return {
        response: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate and download a PDF summary report
   */
  async generatePDF(
    title: string,
    extractedText: string,
    summary: string,
    questions: string
  ): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('extracted_text', extractedText);
      formData.append('summary', summary);
      formData.append('questions', questions);

      const response = await fetch(`${this.baseUrl}/generate-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Create a blob from the response
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `summary_report_${new Date().toISOString().slice(0, 19).replace(/[:\-]/g, '')}.pdf`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }

  /**
   * Enhanced chat with NoteBot using notes context
   */
  async notebotChat(request: NotebotChatRequest): Promise<ChatResponse> {
    console.log("🤖 NoteBot chat request:", request.question);
    
    const response = await fetch(`${this.baseUrl}/notebot/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`NoteBot chat failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("🤖 NoteBot response:", data);
    return data;
  }

  /**
   * Convert text to speech audio and return URL for controls
   */
  async textToSpeech(request: AudioRequest): Promise<AudioResponse> {
    console.log("🔊 Text-to-speech request for text length:", request.text.length);
    
    const response = await fetch(`${this.baseUrl}/text-to-speech`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Text-to-speech failed: ${response.statusText}`);
    }

    // Create blob URL for audio controls
    const blob = await response.blob();
    const audioUrl = window.URL.createObjectURL(blob);
    
    return {
      audio_url: audioUrl,
      success: true
    };
  }

  /**
   * Enhance summary with proper structure and formatting
   */
  async enhanceSummary(text: string): Promise<EnhanceSummaryResponse> {
    console.log("✨ Enhancing summary for text length:", text.length);
    
    const response = await fetch(`${this.baseUrl}/enhance-summary`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Summary enhancement failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✨ Enhanced summary response:", data);
    return data;
  }
}

// Export a singleton instance
export const backendAPI = new BackendAPI();

// Export the class for custom instances
export default BackendAPI;

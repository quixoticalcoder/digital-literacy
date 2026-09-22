import { useState, useEffect } from 'react';
import { backendAPI, type ChatRequest, type ChatResponse, type OCRResponse, type NotebotChatRequest, type AudioRequest, type AudioResponse, type EnhanceSummaryResponse } from '@/lib/api/backend';

/**
 * Hook for managing chat functionality with the AI backend
 */
export function useAIChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (request: ChatRequest): Promise<ChatResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await backendAPI.chat(request);
      if (!response.success) {
        setError(response.error || 'Chat failed');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessageWithImage = async (message: string, file: File): Promise<ChatResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await backendAPI.chatWithImage(message, file);
      if (!response.success) {
        setError(response.error || 'Chat with image failed');
      }
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    sendMessageWithImage,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for managing OCR functionality
 */
export function useOCR() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractText = async (file: File): Promise<string | null> => {
    console.log("🔧 useOCR.extractText called with file:", file.name, file.type)
    setIsLoading(true);
    setError(null);

    try {
      console.log("📡 Calling backendAPI.extractTextFromImage...")
      const response = await backendAPI.extractTextFromImage(file);
      console.log("📨 OCR API response:", response)
      
      if (!response.success) {
        const errorMsg = response.error || 'OCR extraction failed'
        console.error("❌ OCR API error:", errorMsg)
        setError(errorMsg);
        return null;
      }
      console.log("✅ OCR successful, extracted text:", response.extracted_text)
      return response.extracted_text;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error("❌ OCR hook error:", errorMessage)
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    extractText,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}

/**
 * Hook for checking backend health and configuration
 */
export function useBackendHealth() {
  const [isHealthy, setIsHealthy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<{
    gemini_configured: boolean;
    vision_available: boolean;
  } | null>(null);

  const checkHealth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await backendAPI.healthCheck();
      setIsHealthy(response.status === 'healthy');
      setHealthData({
        gemini_configured: response.gemini_configured,
        vision_available: response.vision_available,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Health check failed';
      setError(errorMessage);
      setIsHealthy(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    isHealthy,
    isLoading,
    error,
    healthData,
    checkHealth,
  };
}

/**
 * Hook for NoteBot contextual chat
 */
export function useNotebotChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askNotebot = async (request: NotebotChatRequest): Promise<ChatResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await backendAPI.notebotChat(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { askNotebot, isLoading, error };
}

/**
 * Hook for text-to-speech functionality
 */
export function useTextToSpeech() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAudio = async (request: AudioRequest): Promise<AudioResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await backendAPI.textToSpeech(request);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { generateAudio, isLoading, error };
}

/**
 * Hook for summary enhancement
 */
export function useSummaryEnhancement() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhanceSummary = async (text: string): Promise<EnhanceSummaryResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await backendAPI.enhanceSummary(text);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { enhanceSummary, isLoading, error };
}

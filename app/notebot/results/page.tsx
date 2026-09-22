"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { 
  Download, 
  ArrowLeft,
  FileText,
  Brain,
  Sparkles,
  Eye,
  ChevronDown,
  Loader2,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Volume2,
  Send,
  Bot,
  Play,
  Pause,
  SkipBack,
  SkipForward
} from "lucide-react"
import { useAIChat, useBackendHealth, useNotebotChat, useTextToSpeech, useSummaryEnhancement } from "@/hooks/use-ai-backend"
import { backendAPI } from "@/lib/api/backend"

interface SummaryPoint {
  id: string
  text: string
  category: "key-concept" | "important-fact" | "example" | "definition" | "code-snippet" | "formula"
}

interface Question {
  id: string
  question: string
  answer: string
  difficulty: "easy" | "medium" | "hard"
}

export default function NotebotResults() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading results...</p>
      </div>
    </div>}>
      <NotebotResultsContent />
    </Suspense>
  )
}

function NotebotResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get data from URL params
  const extractedText = searchParams?.get('text') || ''
  const filename = searchParams?.get('filename') || 'Document'
  
  // Simplified function to format only mathematical expressions
  // Helper function to fix malformed HTML tags
  const fixMalformedHTML = (text: string): string => {
    let fixed = text;
    
    // Fix malformed strong tags - these are the main issues
    fixed = fixed.replace(/trong>/g, 'strong>');
    fixed = fixed.replace(/([^<])strong>/g, '$1</strong>');
    fixed = fixed.replace(/strong>([^<])/g, '<strong>$1');
    
    // Fix other common malformed tags
    fixed = fixed.replace(/([^<])\/strong>/g, '$1</strong>');
    fixed = fixed.replace(/([^<])\/em>/g, '$1</em>');
    fixed = fixed.replace(/([^<])\/b>/g, '$1</b>');
    
    return fixed;
  };

  const formatMathExpressions = (text: string): string => {
    // First fix any malformed HTML
    let formatted = fixMalformedHTML(text);
    
    // Process line by line to detect mathematical expressions
    const lines = formatted.split('\n');
    const processedLines = lines.map(line => {
      // Skip if line already has HTML formatting
      if (line.includes('<strong>') || line.includes('<b>') || line.includes('<span>')) {
        return line;
      }
      
      // Detect mathematical expressions and make them bold
      let processedLine = line;
      
      // 1. Complex equations and inequalities (enhanced pattern)
      processedLine = processedLine.replace(/\b([a-zA-Z0-9\s\+\-\*\/\^\(\)\[\]\._{}\|]+\s*[=≤≥<>≠≈≅∝≡∀∃∈∉⊂⊃∩∪]\s*[a-zA-Z0-9\s\+\-\*\/\^\(\)\[\]\._{}\|]+)\b/g, (match) => {
        if (match.trim().length > 2 && /[=≤≥<>≠≈≅∝≡∀∃∈∉⊂⊃∩∪]/.test(match)) {
          return `<strong>${match}</strong>`;
        }
        return match;
      });
      
      // 2. Advanced mathematical functions and operations
      processedLine = processedLine.replace(/\b(sin|cos|tan|cot|sec|csc|sinh|cosh|tanh|asin|acos|atan|log|ln|lg|exp|sqrt|cbrt|abs|floor|ceil|round|min|max|det|trace|rank|dim|ker|lim|sup|inf|argmin|argmax|gcd|lcm)\s*[\(₁₂₃₄₅₆₇₈₉₀]?[^)]*[\)₁₂₃₄₅₆₇₈₉₀]?/g, '<strong>$&</strong>');
      
      // 3. Derivatives and integrals
      processedLine = processedLine.replace(/\b(d[a-zA-Z]\/d[a-zA-Z]|∂[a-zA-Z]\/∂[a-zA-Z]|∇|∫|∬|∭|∮|∯|∰|∑|∏|lim|grad|div|curl)\b/g, '<strong>$&</strong>');
      
      // 4. Fractions (enhanced to include complex fractions)
      processedLine = processedLine.replace(/\b([a-zA-Z0-9\(\)\[\]_{}\^\+\-\*]+)\/([a-zA-Z0-9\(\)\[\]_{}\^\+\-\*]+)\b/g, '<strong>$&</strong>');
      
      // 5. Exponents and powers (enhanced with subscripts)
      processedLine = processedLine.replace(/\b([a-zA-Z0-9\(\)]+)[\^]?([₀₁₂₃₄₅₆₇₈₉ⁿ]|[\^][\(\[]?[a-zA-Z0-9\+\-\*\/]+[\)\]]?)\b/g, '<strong>$&</strong>');
      
      // 6. Mathematical symbols, constants and Greek letters (comprehensive)
      processedLine = processedLine.replace(/([π∞αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ√∛∜∑∏∫∬∭∮∯∰∇∂∆∴∵∀∃∈∉⊂⊃⊆⊇∩∪∅ℝℂℕℤℚ℘ℵ≈≅≡≠≤≥⊥∥⟂∠∡∢°′″‰‱%⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ])/g, '<strong>$1</strong>');
      
      // 7. Chemical formulas
      processedLine = processedLine.replace(/\b([A-Z][a-z]?[₀₁₂₃₄₅₆₇₈₉]*)+\b/g, (match) => {
        if (/[₀₁₂₃₄₅₆₇₈₉]/.test(match) && match.length > 1) {
          return `<strong>${match}</strong>`;
        }
        return match;
      });
      
      // 8. Physics equations and units
      processedLine = processedLine.replace(/\b([A-Za-z]+\s*=\s*[a-zA-Z0-9\s\+\-\*\/\^\(\)\.]+|[0-9\.]+\s*(m|kg|s|A|K|mol|cd|Hz|N|Pa|J|W|C|V|F|Ω|S|Wb|T|H|°C|°F|eV|cal|atm|bar|L|g|cm|mm|km|h|min)\b)/g, '<strong>$&</strong>');
      
      // 9. Matrix notation
      processedLine = processedLine.replace(/(\[[\s\d\+\-\*\/\^\(\)a-zA-Z,;]+\]|\|[\s\d\+\-\*\/\^\(\)a-zA-Z,;]+\|)/g, '<strong>$&</strong>');
      
      // 10. Probability and statistics notation
      processedLine = processedLine.replace(/\b(P\([^)]+\)|E\[[^\]]+\]|Var\([^)]+\)|Cov\([^)]+\)|σ²|μ|σ|χ²|t-test|F-test|ANOVA|p-value|α-level)\b/g, '<strong>$&</strong>');
      
      // 11. Set notation
      processedLine = processedLine.replace(/(\{[^}]*\}|[A-Z]\s*[∩∪⊂⊃⊆⊇]\s*[A-Z]|\|[^|]*\|)/g, '<strong>$&</strong>');
      
      // 12. Vectors and vector notation
      processedLine = processedLine.replace(/\b([a-zA-Z]⃗|→[a-zA-Z]|vec\([^)]+\)|\([0-9\s,;\+\-\*\/\.]+\))/g, '<strong>$&</strong>');
      
      // 13. Logarithms with bases
      processedLine = processedLine.replace(/\b(log[₀₁₂₃₄₅₆₇₈₉₁₀ₑ]*\s*[\(]?[^)]*[\)]?)\b/g, '<strong>$&</strong>');
      
      // 14. Complex numbers
      processedLine = processedLine.replace(/\b([0-9\.\+\-]*[0-9\.]\s*[\+\-]\s*[0-9\.\+\-]*[0-9\.]i|[a-zA-Z]\s*[\+\-]\s*[a-zA-Z]i)\b/g, '<strong>$&</strong>');
      
      // 15. Scientific notation
      processedLine = processedLine.replace(/\b([0-9]+\.?[0-9]*\s*[×x]\s*10[\^\-\+]?[0-9]+|[0-9]+\.?[0-9]*[eE][\+\-]?[0-9]+)\b/g, '<strong>$&</strong>');
      
      // 16. Simple arithmetic (enhanced)
      processedLine = processedLine.replace(/\b(\d+\.?\d*\s*[+\-×÷*/÷]\s*\d+\.?\d*(?:\s*[+\-×÷*/÷]\s*\d+\.?\d*)*)\b/g, '<strong>$&</strong>');
      
      return processedLine;
    });
    
    formatted = processedLines.join('\n');
    
    // Enhanced superscript conversion
    // Convert ^ notation to proper superscript (only if not already in strong tags)
    formatted = formatted.replace(/(?!<strong>[^<]*)\^(\d+)(?![^<]*<\/strong>)/g, '<sup>$1</sup>');
    formatted = formatted.replace(/(?!<strong>[^<]*)\^([a-zA-Z])(?![^<]*<\/strong>)/g, '<sup>$1</sup>');
    formatted = formatted.replace(/(?!<strong>[^<]*)\^(\([^)]+\))(?![^<]*<\/strong>)/g, '<sup>$1</sup>');
    
    // Enhanced subscript conversion
    // Convert _ notation to proper subscript (only if not already in strong tags)
    formatted = formatted.replace(/(?!<strong>[^<]*)_(\d+)(?![^<]*<\/strong>)/g, '<sub>$1</sub>');
    formatted = formatted.replace(/(?!<strong>[^<]*)_([a-zA-Z])(?![^<]*<\/strong>)/g, '<sub>$1</sub>');
    formatted = formatted.replace(/(?!<strong>[^<]*)_(\([^)]+\))(?![^<]*<\/strong>)/g, '<sub>$1</sub>');
    
    // Convert unicode superscripts and subscripts within strong tags
    formatted = formatted.replace(/<strong>([^<]*[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ][^<]*)<\/strong>/g, (match, content) => {
      let processed = content;
      processed = processed.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼⁽⁾ⁿ]/g, (char: string) => {
        const superMap: {[key: string]: string} = {
          '⁰': '<sup>0</sup>', '¹': '<sup>1</sup>', '²': '<sup>2</sup>', '³': '<sup>3</sup>', '⁴': '<sup>4</sup>',
          '⁵': '<sup>5</sup>', '⁶': '<sup>6</sup>', '⁷': '<sup>7</sup>', '⁸': '<sup>8</sup>', '⁹': '<sup>9</sup>',
          '⁺': '<sup>+</sup>', '⁻': '<sup>-</sup>', '⁼': '<sup>=</sup>', '⁽': '<sup>(</sup>', '⁾': '<sup>)</sup>', 'ⁿ': '<sup>n</sup>'
        };
        return superMap[char] || char;
      });
      return `<strong>${processed}</strong>`;
    });
    
    formatted = formatted.replace(/<strong>([^<]*[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎][^<]*)<\/strong>/g, (match, content) => {
      let processed = content;
      processed = processed.replace(/[₀₁₂₃₄₅₆₇₈₉₊₋₌₍₎]/g, (char: string) => {
        const subMap: {[key: string]: string} = {
          '₀': '<sub>0</sub>', '₁': '<sub>1</sub>', '₂': '<sub>2</sub>', '₃': '<sub>3</sub>', '₄': '<sub>4</sub>',
          '₅': '<sub>5</sub>', '₆': '<sub>6</sub>', '₇': '<sub>7</sub>', '₈': '<sub>8</sub>', '₉': '<sub>9</sub>',
          '₊': '<sub>+</sub>', '₋': '<sub>-</sub>', '₌': '<sub>=</sub>', '₍': '<sub>(</sub>', '₎': '<sub>)</sub>'
        };
        return subMap[char] || char;
      });
      return `<strong>${processed}</strong>`;
    });
    
    return formatted;
  };
  
  // State
  const [summary, setSummary] = useState<SummaryPoint[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [openQuestions, setOpenQuestions] = useState<string[]>([])
  const [processingStep, setProcessingStep] = useState<"" | "summary" | "questions">("")
  const [autoGenerated, setAutoGenerated] = useState(false)
  const [structuredSummary, setStructuredSummary] = useState<string>("")
  const [correctedText, setCorrectedText] = useState<string>("")
  const [chatInput, setChatInput] = useState<string>("")
  const [chatHistory, setChatHistory] = useState<Array<{question: string, answer: string}>>([])
  const [showChatbot, setShowChatbot] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string>("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
  
  // Backend hooks
  const { sendMessage, isLoading: chatLoading, error: chatError } = useAIChat()
  const { isHealthy, healthData, isLoading: healthLoading } = useBackendHealth()
  const { askNotebot, isLoading: notebotLoading, error: notebotError } = useNotebotChat()
  const { generateAudio, isLoading: audioLoading, error: audioError } = useTextToSpeech()
  const { enhanceSummary, isLoading: enhanceLoading, error: enhanceError } = useSummaryEnhancement()
  
  // Auto-generate summary and questions when page loads
  useEffect(() => {
    if (extractedText && !autoGenerated && isHealthy) {
      setAutoGenerated(true)
      generateSummaryAndQuestions()
    }
  }, [extractedText, isHealthy, autoGenerated])

  // Cleanup audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        window.URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])
  
  const generateSummaryAndQuestions = async () => {
    try {
      // First enhance the extracted text with proper structure
      setProcessingStep("summary")
      console.log("Starting summary enhancement with text:", extractedText.substring(0, 100) + "...")
      const enhancedResult = await enhanceSummary(extractedText)
      console.log("Enhanced result:", enhancedResult)
      
      if (enhancedResult?.success) {
        console.log("Setting structured summary:", enhancedResult.structured_summary?.substring(0, 100) + "...")
        setCorrectedText(enhancedResult.corrected_text)
        setStructuredSummary(enhancedResult.structured_summary)
        setShowChatbot(true) // Enable chatbot after successful summary generation
      } else {
        console.error("Enhancement failed:", enhancedResult)
      }

      // Generate Summary Points for UI
      const summaryPrompt = `You are an expert academic summarizer and educational content creator. Your task is to analyze the provided text and create a comprehensive, well-structured summary for detailed study notes.

CONTENT ANALYSIS:
First, analyze if the content contains:
- Programming code (any language: Python, Java, C++, JavaScript, etc.)
- Mathematical equations and formulas
- Technical documentation or algorithms
- Regular academic content

INSTRUCTIONS:
1. Create exactly 8-10 detailed key points that capture ALL important information
2. Each point should be comprehensive, detailed, and educational
3. Include specific examples, data, names, dates, or technical details when available
4. For PROGRAMMING CONTENT: Include code snippets, function names, algorithms, syntax patterns
5. For MATHEMATICAL CONTENT: Include equations, formulas, mathematical notation
6. Use appropriate categories to classify each point for better organization
7. Make it a complete study resource that can replace the original document
8. Focus on creating a thorough academic summary suitable for examination preparation

OUTPUT FORMAT - Return ONLY a valid JSON array:
[
  {
    "id": "1", 
    "text": "A comprehensive, detailed summary point with specific information, examples, code snippets, or equations that provides complete understanding of the concept",
    "category": "key-concept"
  },
  {
    "id": "2",
    "text": "Another detailed point with facts, figures, code examples, algorithms, or technical specifications that adds substantial educational value",
    "category": "important-fact"
  }
]

CATEGORIES TO USE:
- "key-concept": Main ideas, theories, principles, or central themes
- "important-fact": Specific data, statistics, facts, names, dates, or technical information  
- "example": Detailed illustrations, case studies, practical applications, or real-world scenarios
- "definition": Comprehensive explanations of terms, concepts, processes, or methodologies
- "code-snippet": Programming code, algorithms, functions, or technical implementations
- "formula": Mathematical equations, formulas, or mathematical expressions

SOURCE TEXT TO ANALYZE:
${extractedText}

Remember: 
- Create a COMPLETE summary that could serve as comprehensive study notes
- Include ALL important details, not just high-level concepts
- For programming content: Include actual code, function names, syntax, algorithms
- For mathematical content: Include complete equations and formulas
- Make each point substantial and informative
- Return ONLY the JSON array, no additional text or formatting.`

      const summaryResponse = await sendMessage({
        message: summaryPrompt,
        context: `Document: ${filename}`
      })
      
      console.log("Raw summary response:", summaryResponse)
      
      if (summaryResponse?.response) {
        let cleanResponse = summaryResponse.response.trim()
        console.log("Clean summary response:", cleanResponse)
        
        // Remove any markdown code blocks or extra formatting
        cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '')
        cleanResponse = cleanResponse.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '')
        
        try {
          // Try to find and parse JSON array
          const jsonMatch = cleanResponse.match(/\[\s*\{[\s\S]*\}\s*\]/)
          if (jsonMatch) {
            const summaryData = JSON.parse(jsonMatch[0])
            console.log("Parsed summary data:", summaryData)
            if (Array.isArray(summaryData) && summaryData.length > 0) {
              setSummary(summaryData)
            } else {
              throw new Error("Invalid summary data structure")
            }
          } else {
            throw new Error("No valid JSON array found")
          }
        } catch (e) {
          console.error("Failed to parse summary JSON:", e)
          console.error("Problematic response:", cleanResponse)
          
          // Fallback: create summary points from text
          const textContent = summaryResponse.response
            .replace(/[\{\}\[\]"]/g, '')
            .split('\n')
            .filter(line => line.trim() && line.length > 15)
            .slice(0, 8)
          
          if (textContent.length > 0) {
            const fallbackSummary: SummaryPoint[] = textContent.map((line, index) => ({
              id: (index + 1).toString(),
              text: line.replace(/^[-•*]\s*/, '').replace(/^\d+[.\)]\s*/, '').trim(),
              category: (index % 4 === 0 ? "key-concept" : 
                        index % 4 === 1 ? "important-fact" : 
                        index % 4 === 2 ? "example" : "definition") as SummaryPoint["category"]
            }))
            setSummary(fallbackSummary)
          } else {
            setSummary([{
              id: "1",
              text: "Summary generation failed. Please try again.",
              category: "key-concept"
            }])
          }
        }
      }
      
      // Generate Questions
      setProcessingStep("questions")
      const questionsPrompt = `You are an expert educator and question designer. Your task is to create effective study questions that test understanding and promote learning.

INSTRUCTIONS:
1. Create exactly 3 study questions based on the provided text
2. Questions should test different levels of understanding (recall, comprehension, application)
3. Each question should have a detailed, educational answer
4. Vary the difficulty levels: 1 easy, 1 medium, 1 hard
5. Focus on the most important concepts from the text

OUTPUT FORMAT - Return ONLY a valid JSON array:
[
  {
    "id": "1",
    "question": "A clear, specific question that tests understanding",
    "answer": "A comprehensive answer that explains the concept thoroughly",
    "difficulty": "easy"
  }
]

DIFFICULTY GUIDELINES:
- "easy": Basic recall and simple comprehension questions
- "medium": Questions requiring analysis or connections between concepts  
- "hard": Questions requiring synthesis, evaluation, or application

SOURCE TEXT FOR QUESTIONS:
${extractedText}

Remember: Return ONLY the JSON array, no additional text or formatting.`

      const questionsResponse = await sendMessage({
        message: questionsPrompt,
        context: `Document: ${filename} - Generate study questions`
      })
      
      console.log("Raw questions response:", questionsResponse)
      
      if (questionsResponse?.response) {
        let cleanResponse = questionsResponse.response.trim()
        console.log("Clean questions response:", cleanResponse)
        
        // Remove any markdown code blocks or extra formatting  
        cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*/g, '')
        cleanResponse = cleanResponse.replace(/^[^[\{]*/, '').replace(/[^}\]]*$/, '')
        
        try {
          // Try to find and parse JSON array
          const jsonMatch = cleanResponse.match(/\[\s*\{[\s\S]*\}\s*\]/)
          if (jsonMatch) {
            let jsonString = jsonMatch[0]
            
            // Fix common JSON formatting issues
            // Fix missing comma before difficulty (this is the main issue)
            jsonString = jsonString.replace(/"\s*\n\s*"difficulty":/g, '",\n    "difficulty":')
            
            // Fix trailing commas
            jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1')
            
            // Fix missing commas between objects
            jsonString = jsonString.replace(/}\s*\n\s*{/g, '},\n  {')
            
            console.log("Fixed JSON string:", jsonString)
            
            const questionsData = JSON.parse(jsonString)
            console.log("Parsed questions data:", questionsData)
            if (Array.isArray(questionsData) && questionsData.length > 0) {
              setQuestions(questionsData)
            } else {
              throw new Error("Invalid questions data structure")
            }
          } else {
            throw new Error("No valid JSON array found")
          }
        } catch (e) {
          console.error("Failed to parse questions JSON:", e)
          console.error("Problematic response:", cleanResponse)
          
          // Fallback: create basic questions
          const fallbackQuestions = [
            {
              id: "1",
              question: "What are the main concepts discussed in this document?",
              answer: "Based on the extracted text, this document covers key information and concepts that can be studied for better understanding.",
              difficulty: "medium" as const
            },
            {
              id: "2", 
              question: "How can this information be applied in practice?",
              answer: "The concepts presented can be applied through practical implementation and further study.",
              difficulty: "hard" as const
            }
          ]
          setQuestions(fallbackQuestions)
        }
      }
      
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setProcessingStep("")
    }
  }
  
  
  // Helper function to strip HTML tags for PDF generation
  const stripHTMLTags = (html: string): string => {
    if (!html || typeof html !== 'string') return '';
    
    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Get text content without HTML tags
    let textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // If no text content was extracted, try manual regex approach
    if (!textContent.trim() && html.trim()) {
      textContent = html.replace(/<[^>]*>/g, '');
      textContent = textContent.replace(/&nbsp;/g, ' ');
      textContent = textContent.replace(/&amp;/g, '&');
      textContent = textContent.replace(/&lt;/g, '<');
      textContent = textContent.replace(/&gt;/g, '>');
      textContent = textContent.replace(/&quot;/g, '"');
    }
    
    // Clean up extra whitespace
    textContent = textContent.replace(/\s+/g, ' ').trim();
    
    return textContent;
  };

  const handleDownloadPDF = async () => {
    try {
      // Format summary as text
      const summaryText = summary.map(point => `• ${point.text} (${point.category})`).join('\n')
      
      // Format questions as text
      const questionsText = questions.map((q, index) => `${index + 1}. ${q.question}\n   Answer: ${q.answer}`).join('\n\n')
      
      // Clean HTML tags from content for PDF generation
      const cleanExtractedText = stripHTMLTags(correctedText || extractedText);
      const cleanStructuredSummary = stripHTMLTags(structuredSummary);
      
      // Use structured summary if available, otherwise use formatted summary
      const finalSummary = cleanStructuredSummary || summaryText;
      
      // Debug logging
      console.log('📋 PDF Download Data:');
      console.log('  Title:', `Summary Report - ${filename}`);
      console.log('  Extracted Text Length:', cleanExtractedText.length);
      console.log('  Summary Length:', finalSummary.length);
      console.log('  Questions Length:', questionsText.length);
      console.log('  Extracted Text Preview:', cleanExtractedText.substring(0, 200));
      console.log('  Summary Preview:', finalSummary.substring(0, 200));
      
      // Generate PDF
      await backendAPI.generatePDF(
        `Summary Report - ${filename}`,
        cleanExtractedText,
        finalSummary,
        questionsText
      )
    } catch (error) {
      console.error('PDF download error:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const handleNotebotChat = async () => {
    if (!chatInput.trim() || notebotLoading) return

    const question = chatInput.trim()
    setChatInput("")

    try {
      const response = await askNotebot({
        question: question,
        notes_context: correctedText || extractedText
      })

      if (response?.success && response.response) {
        setChatHistory(prev => [...prev, {
          question: question,
          answer: response.response
        }])
      }
    } catch (error) {
      console.error('NoteBot chat error:', error)
    }
  }

  const handleGenerateAudio = async () => {
    if (!structuredSummary && !summary.length) {
      alert('No summary available to convert to audio.')
      return
    }

    try {
      const textToConvert = structuredSummary || summary.map(point => point.text).join('. ')
      const result = await generateAudio({ text: textToConvert })
      
      if (result?.audio_url) {
        setAudioUrl(result.audio_url)
        // Create audio element for controls
        const audio = new Audio(result.audio_url)
        setAudioRef(audio)
        
        // Set up audio event listeners
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration)
        })
        
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime)
        })
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false)
          setCurrentTime(0)
        })
      }
    } catch (error) {
      console.error('Audio generation error:', error)
      alert('Failed to generate audio. Please try again.')
    }
  }

  const handlePlayPause = () => {
    if (!audioRef) return

    if (isPlaying) {
      audioRef.pause()
      setIsPlaying(false)
    } else {
      audioRef.play()
      setIsPlaying(true)
    }
  }

  const handleSeek = (seekTime: number) => {
    if (!audioRef) return
    audioRef.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  const handleSpeedChange = (speed: number) => {
    if (!audioRef) return
    audioRef.playbackRate = speed
    setPlaybackRate(speed)
  }

  const handleDownloadAudio = () => {
    if (!audioUrl) return
    
    const link = document.createElement('a')
    link.href = audioUrl
    link.download = `${filename}-summary-audio.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const toggleQuestion = (questionId: string) => {
    setOpenQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    )
  }
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "key-concept": return "text-blue-600 border-blue-600"
      case "important-fact": return "text-green-600 border-green-600"
      case "example": return "text-purple-600 border-purple-600"
      case "definition": return "text-orange-600 border-orange-600"
      case "code-snippet": return "text-indigo-600 border-indigo-600"
      case "formula": return "text-pink-600 border-pink-600"
      default: return "text-gray-600 border-gray-600"
    }
  }
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 border-green-600"
      case "medium": return "text-yellow-600 border-yellow-600"
      case "hard": return "text-red-600 border-red-600"
      default: return "text-gray-600 border-gray-600"
    }
  }
  
  const isProcessing = chatLoading || processingStep !== "" || enhanceLoading
  
  if (!extractedText) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Content Found</h2>
            <p className="text-gray-600 mb-4">No extracted text found. Please go back and upload an image first.</p>
            <Button onClick={() => router.push('/notebot')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button 
                variant="outline" 
                onClick={() => router.push('/notebot')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Upload
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Document Summary
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered analysis of your document
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Powered by Gemini AI
              </Badge>
              {healthLoading ? (
                <Badge variant="outline">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Checking Backend...
                </Badge>
              ) : isHealthy ? (
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Backend Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Backend Offline
                </Badge>
              )}
            </div>
          </div>

          {/* Error Alerts */}
          {chatError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {chatError}
              </AlertDescription>
            </Alert>
          )}

          {/* Document Info Card */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {filename}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {isProcessing ? (
                        "Processing..."
                      ) : (
                        `Analysis complete • ${summary.length} key points • ${questions.length} questions generated`
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownloadPDF}
                    disabled={!summary.length && !questions.length}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            {/* Complete Summary of Notes Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  AI Generated Summary
                </CardTitle>
                <CardDescription>
                  Complete AI-enhanced summary with proper structure, headings, and detailed content
                </CardDescription>
              </CardHeader>
              <CardContent>
                {enhanceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600">Generating comprehensive summary...</span>
                  </div>
                ) : structuredSummary ? (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI Processing Complete</span>
                      <div className="flex gap-2 ml-auto">
                        {!audioUrl ? (
                          <Button
                            onClick={handleGenerateAudio}
                            disabled={audioLoading}
                            variant="outline"
                            size="sm"
                          >
                            {audioLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Volume2 className="h-4 w-4 mr-2" />
                            )}
                            Generate Audio
                          </Button>
                        ) : (
                          <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Audio Ready
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Audio Controls */}
                    {audioUrl && (
                      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-4">
                          <Button
                            onClick={handlePlayPause}
                            variant="outline"
                            size="sm"
                          >
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-blue-700 dark:text-blue-300">{formatTime(currentTime)}</span>
                              <div className="flex-1 relative">
                                <input
                                  type="range"
                                  min="0"
                                  max={duration || 0}
                                  value={currentTime}
                                  onChange={(e) => handleSeek(Number(e.target.value))}
                                  className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                                  style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e5e7eb ${(currentTime / duration) * 100}%, #e5e7eb 100%)`
                                  }}
                                />
                              </div>
                              <span className="text-xs text-blue-700 dark:text-blue-300">{formatTime(duration)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-700 dark:text-blue-300">Speed:</span>
                            <select
                              value={playbackRate}
                              onChange={(e) => handleSpeedChange(Number(e.target.value))}
                              className="text-xs bg-white dark:bg-gray-800 border border-blue-300 rounded px-2 py-1"
                            >
                              <option value={0.5}>0.5x</option>
                              <option value={0.75}>0.75x</option>
                              <option value={1}>1x</option>
                              <option value={1.25}>1.25x</option>
                              <option value={1.5}>1.5x</option>
                              <option value={2}>2x</option>
                            </select>
                          </div>
                          
                          <Button
                            onClick={handleDownloadAudio}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="prose prose-lg max-w-none">
                      <div className="bg-white dark:bg-gray-800 p-8 rounded-md shadow-sm border">
                        {structuredSummary.trim() ? (
                          <div className="prose prose-lg max-w-none dark:prose-invert 
                            prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100
                            prose-h1:text-4xl prose-h1:font-extrabold prose-h1:text-blue-900 dark:prose-h1:text-blue-100 prose-h1:mb-8 prose-h1:mt-0 prose-h1:text-center prose-h1:border-b-2 prose-h1:border-blue-200 prose-h1:pb-4
                            prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-800 dark:prose-h2:text-gray-200 prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-blue-500 prose-h2:pl-4 prose-h2:bg-blue-50 dark:prose-h2:bg-blue-900/20 prose-h2:py-2 prose-h2:rounded-r
                            prose-h3:text-xl prose-h3:font-semibold prose-h3:text-gray-700 dark:prose-h3:text-gray-300 prose-h3:mt-6 prose-h3:mb-3
                            prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                            prose-ul:my-6 prose-ul:space-y-2
                            prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:leading-relaxed prose-li:mb-2
                            prose-strong:font-semibold prose-strong:text-blue-800 dark:prose-strong:text-blue-300
                            prose-code:bg-gray-100 dark:prose-code:bg-gray-700 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                            [&>*]:break-words">
                            {/* Render Markdown content with proper list grouping */}
                            {(() => {
                              const lines = structuredSummary.split('\n');
                              const elements: React.ReactNode[] = [];
                              let currentList: string[] = [];
                              let listIndex = 0;
                              
                              const flushList = () => {
                                if (currentList.length > 0) {
                                  elements.push(
                                    <ul key={`list-${listIndex++}`} className="my-6 space-y-2 ml-4">
                                      {currentList.map((item, idx) => (
                                        <li key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed list-disc pl-2">
                                          <span 
                                            dangerouslySetInnerHTML={{ __html: item }}
                                            className="[&>strong]:font-bold [&>strong]:text-blue-900 [&>strong]:text-base dark:[&>strong]:text-blue-300"
                                          />
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                  currentList = [];
                                }
                              };
                              
                              lines.forEach((line, index) => {
                                const trimmedLine = line.trim();
                                
                                // Main heading (starts with #)
                                if (trimmedLine.startsWith('# ')) {
                                  flushList();
                                  elements.push(
                                    <h1 key={`h1-${index}`} className="text-4xl font-extrabold text-blue-900 dark:text-blue-100 mb-8 mt-0 text-center border-b-2 border-blue-200 pb-4">
                                      {trimmedLine.substring(2).trim()}
                                    </h1>
                                  );
                                }
                                // Section heading (starts with ##)
                                else if (trimmedLine.startsWith('## ')) {
                                  flushList();
                                  elements.push(
                                    <h2 key={`h2-${index}`} className="text-2xl font-bold text-gray-800 dark:text-gray-200 mt-8 mb-4 border-l-4 border-blue-500 pl-4 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r">
                                      {trimmedLine.substring(3).trim()}
                                    </h2>
                                  );
                                }
                                // Subsection heading (starts with ###)
                                else if (trimmedLine.startsWith('### ')) {
                                  flushList();
                                  elements.push(
                                    <h3 key={`h3-${index}`} className="text-xl font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-3">
                                      {trimmedLine.substring(4).trim()}
                                    </h3>
                                  );
                                }
                                // Bullet point (starts with -)
                                else if (trimmedLine.startsWith('- ')) {
                                  const content = trimmedLine.substring(2).trim();
                                  // Convert **text** to bold HTML and format math expressions
                                  const boldText = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                  const formattedText = formatMathExpressions(boldText);
                                  currentList.push(formattedText);
                                }
                                // Regular paragraph (non-empty line that's not a heading or bullet)
                                else if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith('-')) {
                                  flushList();
                                  // Convert **text** to bold HTML and format math expressions
                                  const boldText = trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                                  const formattedText = formatMathExpressions(boldText);
                                  elements.push(
                                    <p key={`p-${index}`} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                                      <span 
                                        dangerouslySetInnerHTML={{ __html: formattedText }}
                                        className="[&>strong]:font-bold [&>strong]:text-blue-900 [&>strong]:text-base dark:[&>strong]:text-blue-300"
                                      />
                                    </p>
                                  );
                                }
                                // Empty line - just continue
                              });
                              
                              // Flush any remaining list items
                              flushList();
                              
                              return elements;
                            })()}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-red-500">
                            <p>No summary content available. Summary length: {structuredSummary.length}</p>
                            <p className="text-xs mt-2">Debug: {JSON.stringify({ structuredSummary: structuredSummary.substring(0, 50) })}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3" />
                        Summary enhanced with AI using advanced reasoning and structured formatting
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Enhanced summary will appear here once generated...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Key Points Summary Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Key Points of Summary
                  {isProcessing && processingStep === "summary" && (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  )}
                </CardTitle>
                <CardDescription>
                  Essential concepts and important information organized by categories
                </CardDescription>
              </CardHeader>
              <CardContent>
              {isProcessing && processingStep === "summary" ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-gray-600">Extracting key points...</span>
                </div>
              ) : summary.length > 0 ? (
                <div className="space-y-4">
                  {summary.map((point) => (
                    <div key={point.id} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-purple-500">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white mb-2 leading-relaxed">{point.text}</p>
                        <Badge variant="outline" className={getCategoryColor(point.category)}>
                          {point.category.replace("-", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Key points will appear here once generated...
                </div>
              )}
              </CardContent>
            </Card>

            {/* Enhanced Structured Summary Section - Removed as it's now integrated above */}

            {/* NoteBot Chat Section */}
            {showChatbot && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    Ask NoteBot
                  </CardTitle>
                  <CardDescription>
                    Ask questions about your notes. NoteBot will only answer based on the uploaded content.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Chat History */}
                    {chatHistory.length > 0 && (
                      <div className="max-h-64 overflow-y-auto space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        {chatHistory.map((chat, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MessageCircle className="h-4 w-4 text-blue-600 mt-1" />
                              <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 border border-blue-100 dark:border-blue-800">
                                <span className="font-medium text-blue-900 dark:text-blue-200">You:</span>
                                <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">{chat.question}</div>
                              </div>
                            </div>
                            <div className="flex items-start gap-2 ml-6">
                              <Bot className="h-4 w-4 text-purple-600 mt-1" />
                              <div className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2 border border-purple-200 dark:border-purple-800">
                                <span className="font-medium text-purple-900 dark:text-purple-200">NoteBot:</span>
                                <div className="text-gray-900 dark:text-gray-100 whitespace-pre-line">{chat.answer}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Chat Input */}
                    <div className="flex gap-2">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask a question about your notes..."
                        onKeyPress={(e) => e.key === 'Enter' && handleNotebotChat()}
                        disabled={notebotLoading}
                      />
                      <Button
                        onClick={handleNotebotChat}
                        disabled={!chatInput.trim() || notebotLoading}
                        size="sm"
                      >
                        {notebotLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {notebotError && (
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {notebotError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Questions Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-600" />
                  Study Questions
                  {isProcessing && processingStep === "questions" && (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  )}
                </CardTitle>
                <CardDescription>
                  Test your understanding with these AI-generated questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing && processingStep === "questions" ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                    <span className="ml-3 text-gray-600">Creating questions...</span>
                  </div>
                ) : questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <Collapsible key={question.id}>
                        <CollapsibleTrigger 
                          onClick={() => toggleQuestion(question.id)} 
                          className="w-full"
                        >
                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">Q:</span>
                              <span className="text-gray-900 dark:text-white">{question.question}</span>
                            </div>
                            <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                            </Badge>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <span className="font-semibold text-blue-900 dark:text-blue-200">A:</span>
                            <span className="text-gray-900 dark:text-gray-100 ml-2">{question.answer}</span>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Questions will appear here once generated...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => router.push('/notebot')}
                variant="outline"
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Analyze Another Document
              </Button>
              <Button 
                onClick={handleDownloadPDF}
                disabled={!summary.length && !questions.length}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Complete Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

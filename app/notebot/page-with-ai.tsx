"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  FileText, 
  Brain, 
  CheckCircle, 
  ChevronDown, 
  Download, 
  Eye, 
  Sparkles,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useAIChat, useOCR, useBackendHealth } from "@/hooks/use-ai-backend"

interface SummaryPoint {
  id: string
  text: string
  category: "key-concept" | "important-fact" | "example" | "definition"
}

interface Question {
  id: string
  question: string
  answer: string
  difficulty: "easy" | "medium" | "hard"
}

export default function NotebotPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [summary, setSummary] = useState<SummaryPoint[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [showResults, setShowResults] = useState(false)
  const [openQuestions, setOpenQuestions] = useState<string[]>([])
  const [processingStep, setProcessingStep] = useState<"" | "ocr" | "summary" | "questions" | "complete">("")

  // Backend hooks
  const { extractText, isLoading: ocrLoading, error: ocrError } = useOCR()
  const { sendMessage, isLoading: chatLoading, error: chatError } = useAIChat()
  const { isHealthy, healthData, isLoading: healthLoading } = useBackendHealth()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Support both PDF and image files
      const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (supportedTypes.includes(file.type)) {
        setUploadedFile(file)
        setShowResults(false)
        setSummary([])
        setQuestions([])
        setExtractedText("")
      } else {
        alert("Please upload a PDF or image file (JPEG, PNG)")
      }
    }
  }

  const generateSummaryFromText = async (text: string): Promise<SummaryPoint[]> => {
    const prompt = `
    Please analyze the following text and create a structured summary with categorized points. 
    Return a JSON array where each object has:
    - id: string (numbered like "1", "2", etc.)
    - text: string (the summary point)
    - category: one of "key-concept", "important-fact", "example", or "definition"

    Text to analyze:
    ${text.substring(0, 3000)} // Limit text to avoid token limits
    
    Please provide exactly 6-8 summary points.
    `

    const response = await sendMessage({ message: prompt })
    if (response?.success && response.response) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const summaryData = JSON.parse(jsonMatch[0])
          return summaryData.map((item: any, index: number) => ({
            id: (index + 1).toString(),
            text: item.text || item.summary || item.point,
            category: item.category || "key-concept"
          }))
        }
      } catch (e) {
        console.error("Failed to parse summary JSON:", e)
      }
      
      // Fallback: create summary from text response
      const lines = response.response.split('\n').filter(line => line.trim())
      return lines.slice(0, 6).map((line, index) => ({
        id: (index + 1).toString(),
        text: line.replace(/^[-*•]\s*/, ''),
        category: "key-concept" as const
      }))
    }
    return []
  }

  const generateQuestionsFromText = async (text: string): Promise<Question[]> => {
    const prompt = `
    Based on the following text, create revision questions to test understanding.
    Return a JSON array where each object has:
    - id: string (numbered like "1", "2", etc.)
    - question: string
    - answer: string (detailed answer)
    - difficulty: one of "easy", "medium", or "hard"

    Text to analyze:
    ${text.substring(0, 3000)} // Limit text to avoid token limits
    
    Please provide exactly 4-5 questions with varying difficulty levels.
    `

    const response = await sendMessage({ message: prompt })
    if (response?.success && response.response) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = response.response.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const questionsData = JSON.parse(jsonMatch[0])
          return questionsData.map((item: any, index: number) => ({
            id: (index + 1).toString(),
            question: item.question,
            answer: item.answer,
            difficulty: item.difficulty || "medium"
          }))
        }
      } catch (e) {
        console.error("Failed to parse questions JSON:", e)
      }
      
      // Fallback: create simple questions
      return [{
        id: "1",
        question: "What are the key concepts covered in this document?",
        answer: response.response.substring(0, 200) + "...",
        difficulty: "medium" as const
      }]
    }
    return []
  }

  const handleProcessFile = async () => {
    if (!uploadedFile) return

    try {
      // Step 1: Extract text from file
      setProcessingStep("ocr")
      let text = ""
      
      // Use extractText for both images and PDFs
      text = await extractText(uploadedFile) || ""
      if (!text) {
        alert("Could not extract text from the file. Please try a clearer file.")
        return
      }
      setExtractedText(text)

      // Step 2: Generate summary
      setProcessingStep("summary")
      const summaryPoints = await generateSummaryFromText(text)
      setSummary(summaryPoints)

      // Step 3: Generate questions
      setProcessingStep("questions")
      const generatedQuestions = await generateQuestionsFromText(text)
      setQuestions(generatedQuestions)

      // Complete
      setProcessingStep("complete")
      setShowResults(true)
    } catch (error) {
      console.error("Processing error:", error)
      alert("An error occurred while processing the file. Please try again.")
    } finally {
      setProcessingStep("")
    }
  }

  const toggleQuestion = (questionId: string) => {
    setOpenQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    )
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "definition":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "key-concept":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "important-fact":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "example":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const isProcessing = ocrLoading || chatLoading || processingStep !== ""

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Notebot AI</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Upload your documents and images to get AI-powered summaries and revision questions
            </p>
            <div className="flex items-center justify-center gap-4">
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

          {/* Backend Status Alert */}
          {!healthLoading && !isHealthy && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The Python backend is not running. Please start the backend server to use AI features.
                Run <code>setup_backend.bat</code> and then <code>start_backend.bat</code> in the backend folder.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alerts */}
          {(ocrError || chatError) && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {ocrError || chatError}
              </AlertDescription>
            </Alert>
          )}

          {!showResults ? (
            <>
              {/* Upload Section */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Your Document
                  </CardTitle>
                  <CardDescription>
                    Upload images (JPEG, PNG) or PDF documents to get started. We support files up to 10MB.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                    <Input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      id="file-upload" 
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Click to upload document or image
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          PDF, JPEG, PNG files supported
                        </p>
                      </div>
                    </label>
                  </div>

                  {uploadedFile && (
                    <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-800 dark:text-green-200">{uploadedFile.name}</span>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                        </Badge>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleProcessFile}
                    disabled={!uploadedFile || isProcessing || !isHealthy}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {processingStep === "ocr" && "Extracting text..."}
                        {processingStep === "summary" && "Generating summary..."}
                        {processingStep === "questions" && "Creating questions..."}
                        {processingStep === "complete" && "Finalizing..."}
                        {!processingStep && "Processing..."}
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Summary & Questions
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Features Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Smart Summarization
                    </CardTitle>
                    <CardDescription>
                      Get key points, definitions, and important facts extracted from your documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        OCR text extraction
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Categorized bullet points
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Key concepts highlighted
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI-Generated Questions
                    </CardTitle>
                    <CardDescription>
                      Gemini AI creates questions to test your understanding and help with revision
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Multiple difficulty levels
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Detailed answers
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Perfect for exam prep
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <>
              {/* Results Section */}
              <div className="space-y-8">
                {/* Document Info */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {uploadedFile?.name || "Document"}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Processed successfully • {summary.length} key points • {questions.length} questions generated
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Extracted Text Preview */}
                {extractedText && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-gray-600" />
                        Extracted Text
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg max-h-48 overflow-y-auto">
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {extractedText.length > 500 ? extractedText.substring(0, 500) + "..." : extractedText}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Summary Section */}
                {summary.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI-Generated Summary
                      </CardTitle>
                      <CardDescription>Key points and concepts extracted from your document</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {summary.map((point) => (
                          <div key={point.id} className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex-shrink-0 mt-1">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 dark:text-white mb-2">{point.text}</p>
                              <Badge variant="outline" className={getCategoryColor(point.category)}>
                                {point.category.replace("-", " ")}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Questions Section */}
                {questions.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-green-600" />
                        Revision Questions
                      </CardTitle>
                      <CardDescription>Test your understanding with these AI-generated questions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {questions.map((question) => (
                          <Collapsible key={question.id}>
                            <CollapsibleTrigger onClick={() => toggleQuestion(question.id)} className="w-full">
                              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-3 text-left">
                                  <ChevronDown
                                    className={`h-4 w-4 transition-transform ${
                                      openQuestions.includes(question.id) ? "rotate-180" : ""
                                    }`}
                                  />
                                  <span className="font-medium text-gray-900 dark:text-white">{question.question}</span>
                                </div>
                                <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                                  {question.difficulty}
                                </Badge>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-gray-800 dark:text-gray-200">{question.answer}</p>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => {
                      setShowResults(false)
                      setUploadedFile(null)
                      setExtractedText("")
                      setSummary([])
                      setQuestions([])
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Upload Another Document
                  </Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Save to Dashboard</Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

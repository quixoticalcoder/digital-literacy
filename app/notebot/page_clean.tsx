"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Sparkles,
  AlertCircle,
  Loader2,
  Brain
} from "lucide-react"
import { useOCR, useBackendHealth } from "@/hooks/use-ai-backend"

export default function NotebotPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [processingStep, setProcessingStep] = useState<"" | "ocr">("")

  // Backend hooks
  const { extractText, isLoading: ocrLoading, error: ocrError } = useOCR()
  const { isHealthy, isLoading: healthLoading } = useBackendHealth()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const supportedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (supportedTypes.includes(file.type)) {
        setUploadedFile(file)
      } else {
        alert("Please upload a PDF or image file (JPEG, PNG)")
      }
    }
  }

  const handleProcessFile = async () => {
    if (!uploadedFile) return

    try {
      setProcessingStep("ocr")
      
      if (uploadedFile.type === 'application/pdf') {
        alert("PDF text extraction requires additional setup. Please upload an image for now.")
        setProcessingStep("")
        return
      }

      console.log("📸 Calling extractText with file:", uploadedFile.name, uploadedFile.type)
      const text = await extractText(uploadedFile) || ""
      console.log("📝 OCR result:", text)

      if (!text) {
        alert("Could not extract text from the image. Please try a clearer image.")
        setProcessingStep("")
        return
      }

      // Navigate to results page with extracted text
      const params = new URLSearchParams({
        text: text,
        filename: uploadedFile.name
      })
      window.location.href = `/notebot/results?${params.toString()}`

    } catch (error) {
      console.error("❌ Processing error:", error)
      alert("An error occurred while processing the file. Please try again.")
    } finally {
      setProcessingStep("")
    }
  }

  const isProcessing = ocrLoading || processingStep !== ""

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
          {ocrError && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {ocrError}
              </AlertDescription>
            </Alert>
          )}

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
                {isProcessing && processingStep === "ocr" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting text...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Extract Text from Image
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
        </div>
      </div>
    </div>
  )
}

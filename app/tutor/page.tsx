"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Send, RotateCcw, Lightbulb, Languages, Volume2, AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAIChat, useBackendHealth } from "@/hooks/use-ai-backend"


interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

// Hydration-safe time display
function MessageTime({ timestamp }: { timestamp: Date }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(new Date(timestamp).toLocaleTimeString());
  }, [timestamp]);
  return (
    <span className="text-xs opacity-70 mt-2 block">{time}</span>
  );
}

const suggestedPrompts = [
  { 
    text: "Explain in simple terms", 
    icon: RotateCcw, 
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    prompt: "Please explain the previous topic in very simple terms with examples from daily life."
  },
  { 
    text: "Give practical example", 
    icon: Lightbulb, 
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    prompt: "Can you give me a practical, real-world example of this concept?"
  },
  { 
    text: "Explain in Hindi", 
    icon: Languages, 
    color: "bg-green-100 text-green-700 hover:bg-green-200",
    prompt: "Please explain this in Hindi with English technical terms where needed."
  },
  { 
    text: "Step by step guide", 
    icon: Volume2, 
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    prompt: "Can you provide a step-by-step guide for this?"
  },
]

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Namaste! I'm your AI tutor powered by Google's Gemini AI. I'm here to help you learn digital skills in a way that's easy to understand. What would you like to learn today? You can ask me about computers, internet, mobile apps, or any digital topic!",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Backend hooks
  const { sendMessage, isLoading, error } = useAIChat()
  const { isHealthy, healthData, isLoading: healthLoading } = useBackendHealth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim()
    if (!textToSend) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: textToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")

    if (!isHealthy) {
      // Add error message if backend is not available
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, but I'm currently offline. Please make sure the backend server is running to chat with me.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
      return
    }

    try {
      // Send to AI backend
      const response = await sendMessage({
        message: textToSend,
        context: "You are a helpful AI tutor focused on teaching digital literacy skills to rural Indian users. Be patient, use simple language, and provide practical examples. You can respond in both English and Hindi when appropriate."
      })

      if (response?.success && response.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.response,
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I'm sorry, I couldn't process your message right now. Please try again.",
          sender: "ai",
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } catch (err) {
      console.error("Chat error:", err)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm experiencing some technical difficulties. Please try again in a moment.",
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestedPrompt = (prompt: string) => {
    handleSendMessage(prompt)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Tutor</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your personal AI assistant for learning digital skills
            </p>
            <div className="flex items-center justify-center gap-4">
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              >
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
                  AI Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-red-100 text-red-800">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  AI Offline
                </Badge>
              )}
            </div>
          </div>

          {/* Backend Status Alert */}
          {!healthLoading && !isHealthy && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The AI backend is not running. Please start the backend server to chat with the AI tutor.
                Run <code>setup_backend.bat</code> and then <code>start_backend.bat</code> in the backend folder.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Chat Container */}
          <Card className="h-[600px] flex flex-col">
            {/* Messages Area */}
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : ""}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage
                          src={message.sender === "user" ? "/placeholder-user.jpg" : "/placeholder-logo.png"}
                        />
                        <AvatarFallback>
                          {message.sender === "user" ? "U" : "AI"}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`rounded-lg p-4 ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <MessageTime timestamp={message.timestamp} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[80%]">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src="/placeholder-logo.png" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-gray-500">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </CardContent>

            {/* Suggested Prompts */}
            {!isLoading && (
              <div className="px-6 py-2 border-t">
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={`${prompt.color} border-none`}
                      onClick={() => handleSuggestedPrompt(prompt.prompt)}
                      disabled={!isHealthy}
                    >
                      <prompt.icon className="h-3 w-3 mr-1" />
                      {prompt.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isHealthy ? "Ask me anything about digital skills..." : "AI backend is offline..."}
                  className="flex-1"
                  disabled={isLoading || !isHealthy}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading || !isHealthy}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

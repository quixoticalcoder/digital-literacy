"use client"
import RoadmapGenerator from "../../components/roadmap-generator"

import { Map, Sparkles, CheckCircle } from "lucide-react"

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8 flex flex-col items-center justify-center">
          <Map className="h-10 w-10 text-blue-500 mb-2" />
          <h1 className="text-3xl font-extrabold text-black dark:text-white tracking-tight">AI Roadmap Generator</h1>
          <h2 className="text-lg font-medium text-gray-700 dark:text-blue-200 mt-2 mb-4">Instantly generate a personalized learning roadmap for any topic</h2>
          <div className="flex flex-row items-center justify-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-semibold shadow-sm border border-transparent">
              <Sparkles className="h-3 w-3 mr-1" />
              <span className="text-black dark:text-purple-200">Powered by Gemini AI</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-semibold shadow-sm border border-transparent">
              <CheckCircle className="h-3 w-3 mr-1" />
              <span className="text-black dark:text-green-200">AI Connected</span>
            </span>
          </div>
        </div>
        <RoadmapGenerator />
      </div>
    </div>
  )
}

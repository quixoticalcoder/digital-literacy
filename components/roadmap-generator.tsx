"use client";
import React from "react";

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Map, Youtube, Sparkles, CheckCircle } from "lucide-react"


import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";


export default function RoadmapGenerator() {
  const [topic, setTopic] = useState("");
  const [roadmap, setRoadmap] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);

  const generateRoadmap = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:8001/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.detail || "Failed to generate roadmap");
        setRoadmap("");
        return;
      }
      setRoadmap(data.roadmap?.markdown || "");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setRoadmap("");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!roadmap) return;
    setPdfLoading(true);
    try {
      const response = await fetch("http://localhost:8001/download-roadmap-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          roadmap: roadmap
        }),
      });
      if (!response.ok) {
        setError("Failed to generate PDF");
        setPdfLoading(false);
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${topic}-roadmap.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError("PDF download failed");
    } finally {
      setPdfLoading(false);
    }
  };

  // Custom renderer for ReactMarkdown to style headings and objectives
  const components = {
    h1: ({node, ...props}: any) => (
      <h1 className="text-4xl font-extrabold text-blue-700 dark:text-blue-300 mb-6 border-b-2 border-blue-200 dark:border-blue-700 pb-2" {...props} />
    ),
    h2: ({node, ...props}: any) => (
      <h2 className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-8 mb-3" {...props} />
    ),
    h3: ({node, ...props}: any) => {
      // Style all subheadings (Objectives, Resources, Topics, Projects, etc.) in blue
      const text = props.children && props.children[0] && typeof props.children[0] === 'string' ? props.children[0].toLowerCase() : '';
      if (
        text.includes('objective') ||
        text.includes('resource') ||
        text.includes('topic') ||
        text.includes('project')
      ) {
        return <h3 className="text-xl font-extrabold text-blue-700 dark:text-blue-300 mt-6 mb-2 tracking-wide" {...props} />
      }
      return <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-6 mb-2" {...props} />
    },
    li: ({node, children, ...props}: any) => {
      // If parent is Objectives, style differently
      const parent = node && node.parent && node.parent.children && node.parent.children[0];
      const isObjectives = parent && parent.type === 'heading' && parent.depth === 3 && parent.children && parent.children[0] && parent.children[0].value && parent.children[0].value.toLowerCase().includes('objective');
      return (
        <li className={isObjectives ? "font-semibold text-lg text-green-800 dark:text-green-200 mb-1" : "mb-1"} {...props}>{children}</li>
      );
    },
    a: ({node, ...props}: any) => (
      <a
        {...props}
        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      />
    ),
  };

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-10">
          {/* Main Card with Heading and Input */}
          <Card className="mb-8 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg">
            <CardContent className="p-8 flex flex-col items-center">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  generateRoadmap();
                }}
                className="flex flex-col md:flex-row gap-4 w-full"
                autoComplete="off"
              >
                <Input
                  type="text"
                  placeholder="What do you want to learn? (e.g. Data Science, React, AI)"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  disabled={loading}
                  required
                  className="flex-1 text-lg px-4 py-3 rounded-lg shadow-sm bg-white text-black placeholder-black dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 border-gray-300 dark:border-gray-700"
                  autoFocus
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto text-lg px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md border-0"
                >
                  {loading && <Loader2 className="animate-spin mr-2" />}
                  {loading ? "Generating..." : "Generate"}
                </Button>
              </form>
              <div className="mt-4 text-sm text-black dark:text-gray-400 w-full text-left">
                <b>Tip:</b> The roadmap will be structured with clear phases, headings, bullet points, and clickable resource links for easy navigation.
              </div>
            </CardContent>
          </Card>
          {/* Roadmap Output Card (single, not nested) */}
          {roadmap && (
            <Card className="mb-8 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg">
              <CardContent className="prose max-w-none dark:prose-invert text-lg leading-relaxed px-2 md:px-4 py-2 md:py-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{roadmap}</ReactMarkdown>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="secondary"
                  onClick={downloadPDF}
                  disabled={pdfLoading}
                  className="gap-2 text-base px-6 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold border-0"
                >
                  {pdfLoading && <Loader2 className="animate-spin" />}
                  Download PDF
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Enhanced Info Panel - Notebot Style */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg flex flex-col items-center justify-center text-center p-0">
              <CardHeader className="flex flex-col items-center gap-2 pt-6 pb-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-green-200 text-center whitespace-nowrap">How to Use</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="list-disc ml-4 space-y-2 text-gray-700 dark:text-gray-200 text-base text-left">
                  <li>Enter any topic (e.g. "Data Science", "React", "AI") to get a step-by-step learning roadmap.</li>
                  <li>Each phase includes objectives, topics, curated YouTube/video resources, and project ideas.</li>
                  <li>All content is generated by AI and tailored to your input.</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 shadow-lg flex flex-col items-center justify-center text-center p-0">
              <CardHeader className="flex flex-col items-center gap-2 pt-6 pb-2">
                <Sparkles className="h-8 w-8 text-blue-400" />
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-blue-200 text-center whitespace-nowrap">Features</CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <ul className="list-disc ml-4 space-y-2 text-gray-700 dark:text-gray-200 text-base text-left">
                  <li>Download your roadmap as a PDF for offline use or sharing.</li>
                  <li>Perfect for self-learners, students, and professionals planning their upskilling journey.</li>
                  <li>Modern, beautiful UI with dark mode support.</li>
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, MessageCircle, Brain, Wifi, ArrowRight, Heart } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Personalized Learning Paths",
    description: "AI-powered curriculum tailored to your learning pace and goals",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    icon: MessageCircle,
    title: "AI Tutor Chatbot",
    description: "Get instant help and explanations in your preferred language",
    color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
  },
  {
    icon: Brain,
    title: "Notebot AI",
    description: "Smart PDF summarization and question generation for better learning",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    icon: Wifi,
    title: "Offline Access",
    description: "Continue learning even without internet connectivity",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
  },
]

const stats = [
  { number: "50K+", label: "Rural Learners" },
  { number: "15+", label: "Languages" },
  { number: "95%", label: "Success Rate" },
  { number: "24/7", label: "AI Support" },
]

const partnerships = [
  "Digital India Initiative",
  "Ministry of Education",
  "UNICEF India",
  "Tata Trusts",
  "Akshaya Patra Foundation",
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              🇮🇳 Made for Rural India
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">digital-literacy</h1>
            <p className="mt-4 text-xl text-blue-600 dark:text-blue-400 font-semibold">
              Bridging India's Digital Divide
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Empowering rural communities with AI-powered digital literacy. Learn at your own pace, in your own
              language, with personalized guidance from our intelligent tutoring system.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/tutor">
                <Button variant="outline" size="lg" className="px-8 py-3 bg-transparent">
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stat.number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Powerful Features for Rural Learning
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform is designed specifically for the unique challenges and opportunities in rural India's digital
              education landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mx-auto mb-4`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">How digital-literacy Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Choose Your Goal</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Select what you want to learn - from basic computer skills to advanced digital literacy
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">AI Creates Your Path</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our AI analyzes your needs and creates a personalized learning journey just for you
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-300">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Learn & Grow</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Practice with interactive lessons, get help from AI tutor, and track your progress
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Trusted Partners</h2>
            <p className="text-gray-600 dark:text-gray-300">Working together to bridge India's digital divide</p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {partnerships.map((partner, index) => (
              <Badge key={index} variant="outline" className="px-4 py-2">
                {partner}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Your Digital Journey?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of learners across rural India who are building their digital skills with digital-literacy
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button size="lg" variant="secondary" className="px-8 py-3">
                Start Learning Today
              </Button>
            </Link>
            <Link href="/tutor">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Try AI Tutor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">digital-literacy</span>
              </div>
              <p className="text-gray-400">Empowering rural India through AI-powered digital literacy education.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/tutor" className="hover:text-white">
                    AI Tutor
                  </Link>
                </li>
                <li>
                  <Link href="/learning-path" className="hover:text-white">
                    Learning Paths
                  </Link>
                </li>
                <li>
                  <Link href="/notebot" className="hover:text-white">
                    Notebot AI
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white">
                    Dashboard
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Feedback
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    WhatsApp Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Telegram Channel
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; 2024 digital-literacy. Made with <Heart className="inline h-4 w-4 text-red-500" /> for Rural India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

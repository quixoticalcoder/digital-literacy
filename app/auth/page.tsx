"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, User, Phone, MapPin, BookOpen, UserPlus, LogIn, Globe } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      router.push("/dashboard")
    }, 2000)
  }

  const handleGuestMode = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800 dark:text-white">digital-literacy</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isLogin ? "Welcome Back!" : "Join digital-literacy"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {isLogin ? "Continue your digital learning journey" : "Start your digital literacy journey today"}
          </p>
          <Badge variant="secondary" className="mt-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Globe className="h-3 w-3 mr-1" />
            Available in 15+ Languages
          </Badge>
        </div>

        {/* Auth Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isLogin ? (
                <>
                  <LogIn className="h-5 w-5" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  Create Account
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Enter your credentials to access your account" : "Fill in your details to get started"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="name" placeholder="Enter your full name" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="phone" type="tel" placeholder="+91 98765 43210" className="pl-10" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Village/City</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="location" placeholder="Enter your location" className="pl-10" required />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="email" type="email" placeholder="Enter your email" className="pl-10" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="password" type="password" placeholder="Enter your password" className="pl-10" required />
                </div>
              </div>

              {isLogin && (
                <div className="text-right">
                  <Link href="#" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Forgot password?
                  </Link>
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>{isLogin ? "Sign In" : "Create Account"}</>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <Separator className="my-4" />

              <Button variant="outline" className="w-full bg-transparent" onClick={handleGuestMode}>
                <User className="h-4 w-4 mr-2" />
                Continue as Guest
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">What you'll get with digital-literacy:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Badge variant="outline">🤖 AI Tutor</Badge>
            <Badge variant="outline">📚 Personalized Learning</Badge>
            <Badge variant="outline">📄 PDF Summarizer</Badge>
            <Badge variant="outline">🏆 Progress Tracking</Badge>
            <Badge variant="outline">📱 Mobile Friendly</Badge>
          </div>
        </div>

        {/* Support Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Need help? Contact us on WhatsApp: +91 98765 43210</p>
        </div>
      </div>
    </div>
  )
}

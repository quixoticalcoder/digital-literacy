"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle,
  Circle,
  Clock,
  Star,
  ArrowRight,
  Smartphone,
  Mail,
  Globe,
  CreditCard,
  FileText,
  Shield,
} from "lucide-react"

const learningGoals = [
  {
    id: "email",
    title: "Learn to use Email",
    description: "Master email communication for personal and professional use",
    icon: Mail,
    duration: "2-3 weeks",
    difficulty: "Beginner",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    id: "smartphone",
    title: "Smartphone Basics",
    description: "Learn essential smartphone features and apps",
    icon: Smartphone,
    duration: "1-2 weeks",
    difficulty: "Beginner",
    color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300",
  },
  {
    id: "internet",
    title: "Internet & Web Browsing",
    description: "Navigate the internet safely and effectively",
    icon: Globe,
    duration: "2-3 weeks",
    difficulty: "Beginner",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    id: "banking",
    title: "Digital Banking",
    description: "Learn online banking and digital payments",
    icon: CreditCard,
    duration: "3-4 weeks",
    difficulty: "Intermediate",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300",
  },
  {
    id: "documents",
    title: "Digital Documents",
    description: "Create and manage digital documents",
    icon: FileText,
    duration: "2-3 weeks",
    difficulty: "Intermediate",
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300",
  },
  {
    id: "security",
    title: "Digital Security",
    description: "Stay safe online and protect your data",
    icon: Shield,
    duration: "1-2 weeks",
    difficulty: "Intermediate",
    color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
  },
]

const samplePath = {
  title: "Learn to use Email",
  description: "Master email communication step by step",
  totalSteps: 8,
  currentStep: 3,
  estimatedTime: "2-3 weeks",
  milestones: [
    {
      id: 1,
      title: "Understanding Email Basics",
      description: "What is email and why is it important?",
      status: "completed",
      duration: "15 min",
    },
    {
      id: 2,
      title: "Creating Your First Email Account",
      description: "Step-by-step Gmail account creation",
      status: "completed",
      duration: "20 min",
    },
    {
      id: 3,
      title: "Writing Your First Email",
      description: "Compose, format, and send emails",
      status: "current",
      duration: "25 min",
    },
    {
      id: 4,
      title: "Managing Your Inbox",
      description: "Organize, read, and reply to emails",
      status: "upcoming",
      duration: "30 min",
    },
    {
      id: 5,
      title: "Email Attachments",
      description: "Send and receive files via email",
      status: "upcoming",
      duration: "20 min",
    },
    {
      id: 6,
      title: "Email Security & Safety",
      description: "Recognize spam and stay safe online",
      status: "upcoming",
      duration: "25 min",
    },
    {
      id: 7,
      title: "Advanced Email Features",
      description: "Folders, labels, and email organization",
      status: "upcoming",
      duration: "30 min",
    },
    {
      id: 8,
      title: "Email Etiquette & Best Practices",
      description: "Professional email communication",
      status: "upcoming",
      duration: "20 min",
    },
  ],
}

export default function LearningPathPage() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [showPath, setShowPath] = useState(false)

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId)
    setShowPath(true)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "current":
        return <Circle className="h-5 w-5 text-blue-600 fill-blue-600" />
      default:
        return <Circle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
      case "current":
        return "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
      default:
        return "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/20"
    }
  }

  if (showPath) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button variant="ghost" onClick={() => setShowPath(false)} className="mb-4">
                ← Back to Goals
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{samplePath.title}</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{samplePath.description}</p>

              {/* Progress Overview */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Your Progress</h3>
                      <Progress
                        value={(samplePath.currentStep / samplePath.totalSteps) * 100}
                        className="w-full md:w-64"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                        Step {samplePath.currentStep} of {samplePath.totalSteps} completed
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {samplePath.estimatedTime}
                      </Badge>
                      <Badge variant="outline">
                        <Star className="h-3 w-3 mr-1" />
                        Beginner Level
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Milestones */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Learning Milestones</h2>

              {samplePath.milestones.map((milestone, index) => (
                <Card
                  key={milestone.id}
                  className={`${getStatusColor(milestone.status)} transition-all hover:shadow-md`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getStatusIcon(milestone.status)}</div>
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{milestone.title}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{milestone.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{milestone.duration}</Badge>
                            {milestone.status === "current" && (
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                Continue
                                <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                            {milestone.status === "upcoming" && (
                              <Button size="sm" variant="outline" disabled>
                                Locked
                              </Button>
                            )}
                            {milestone.status === "completed" && (
                              <Button size="sm" variant="outline">
                                Review
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Next Steps */}
            <Card className="mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-2">🎯 What's Next?</h3>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  Complete "Writing Your First Email" to unlock the next milestone. You're doing great - keep up the
                  momentum!
                </p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Continue Learning
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Personalized Learning Paths</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose your learning goal and let our AI create a personalized roadmap tailored to your pace and
              experience level.
            </p>
          </div>

          {/* Learning Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {learningGoals.map((goal) => {
              const Icon = goal.icon
              return (
                <Card key={goal.id} className="hover:shadow-lg transition-all cursor-pointer group">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${goal.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{goal.title}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">{goal.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {goal.duration}
                      </Badge>
                      <Badge variant={goal.difficulty === "Beginner" ? "default" : "secondary"}>
                        {goal.difficulty}
                      </Badge>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => handleGoalSelect(goal.id)}>
                      Start Learning Path
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* How It Works Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
              How Personalized Learning Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-300">1</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Choose Your Goal</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Select what you want to learn from our curated list of essential digital skills
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">2</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">AI Creates Your Path</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI analyzes your goal and creates a step-by-step learning journey
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-300">3</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Learn & Progress</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Follow your personalized milestones and track your progress along the way
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

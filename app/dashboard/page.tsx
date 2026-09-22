"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  BookOpen,
  MessageCircle,
  Brain,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Star,
  Award,
  Calendar,
  ArrowRight,
  Zap,
} from "lucide-react"

const userStats = {
  name: "Priya Sharma",
  level: 3,
  xp: 1250,
  xpToNext: 1500,
  streak: 7,
  completedLessons: 24,
  totalTime: "18 hours",
}

const skillBadges = [
  { name: "Email Expert", icon: "📧", earned: true, date: "2 days ago" },
  { name: "Internet Navigator", icon: "🌐", earned: true, date: "1 week ago" },
  { name: "Digital Safety", icon: "🛡️", earned: true, date: "2 weeks ago" },
  { name: "Smartphone Pro", icon: "📱", earned: false, progress: 75 },
  { name: "Banking Basics", icon: "🏦", earned: false, progress: 30 },
  { name: "Document Master", icon: "📄", earned: false, progress: 0 },
]

const recentActivity = [
  {
    id: 1,
    type: "lesson",
    title: 'Completed "Writing Professional Emails"',
    time: "2 hours ago",
    xp: 50,
    icon: BookOpen,
  },
  {
    id: 2,
    type: "chat",
    title: "Asked AI Tutor about email attachments",
    time: "4 hours ago",
    xp: 10,
    icon: MessageCircle,
  },
  {
    id: 3,
    type: "notebot",
    title: 'Summarized "Digital Banking Guide"',
    time: "1 day ago",
    xp: 25,
    icon: Brain,
  },
  {
    id: 4,
    type: "achievement",
    title: 'Earned "Email Expert" badge',
    time: "2 days ago",
    xp: 100,
    icon: Trophy,
  },
]

const currentGoals = [
  {
    id: 1,
    title: "Complete Smartphone Basics",
    progress: 75,
    target: "This week",
    color: "bg-blue-600",
  },
  {
    id: 2,
    title: "Practice Digital Banking",
    progress: 30,
    target: "Next week",
    color: "bg-green-600",
  },
  {
    id: 3,
    title: "Learn Document Creation",
    progress: 0,
    target: "This month",
    color: "bg-purple-600",
  },
]

const quickActions = [
  {
    title: "Continue Learning",
    description: "Resume your current lesson",
    icon: BookOpen,
    href: "/learning-path",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    title: "Ask AI Tutor",
    description: "Get help with any topic",
    icon: MessageCircle,
    href: "/tutor",
    color: "bg-green-600 hover:bg-green-700",
  },
  {
    title: "Summarize PDF",
    description: "Upload and analyze documents",
    icon: Brain,
    href: "/notebot",
    color: "bg-purple-600 hover:bg-purple-700",
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {userStats.name}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              You're doing great! Keep up the momentum and continue your digital learning journey.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Level</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.level}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">XP Points</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.xp}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Streak</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.streak} days</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Lessons</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userStats.completedLessons}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Progress Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Your Progress
                  </CardTitle>
                  <CardDescription>Track your learning journey and see how far you've come</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Level {userStats.level} Progress
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {userStats.xp} / {userStats.xpToNext} XP
                        </span>
                      </div>
                      <Progress value={(userStats.xp / userStats.xpToNext) * 100} className="h-3" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {userStats.completedLessons}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Lessons Completed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.totalTime}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Time Spent Learning</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.streak}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Day Streak</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Goals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Current Goals
                  </CardTitle>
                  <CardDescription>Your active learning objectives and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentGoals.map((goal) => (
                      <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">{goal.title}</h3>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {goal.target}
                          </Badge>
                        </div>
                        <Progress value={goal.progress} className="mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-300">{goal.progress}% complete</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest learning activities and achievements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      const Icon = activity.icon
                      return (
                        <div
                          key={activity.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                        >
                          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{activity.time}</p>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            +{activity.xp} XP
                          </Badge>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Jump back into learning or try something new</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action, index) => {
                      const Icon = action.icon
                      return (
                        <Link key={index} href={action.href}>
                          <Button className={`w-full justify-start ${action.color} text-white`}>
                            <Icon className="h-4 w-4 mr-2" />
                            <div className="text-left">
                              <div className="font-medium">{action.title}</div>
                              <div className="text-xs opacity-90">{action.description}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 ml-auto" />
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Skill Badges */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skill Badges
                  </CardTitle>
                  <CardDescription>Your achievements and progress in different skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {skillBadges.map((badge, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          badge.earned
                            ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                            : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{badge.icon}</div>
                          <div className="flex-1">
                            <h3
                              className={`font-medium ${
                                badge.earned ? "text-green-800 dark:text-green-200" : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {badge.name}
                            </h3>
                            {badge.earned ? (
                              <p className="text-sm text-green-600 dark:text-green-400">Earned {badge.date}</p>
                            ) : (
                              <div className="mt-1">
                                <Progress value={badge.progress} className="h-2" />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {badge.progress}% complete
                                </p>
                              </div>
                            )}
                          </div>
                          {badge.earned && <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

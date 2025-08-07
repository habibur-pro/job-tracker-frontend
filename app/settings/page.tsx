"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Briefcase, ArrowLeft, Key, Shield, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'
import Link from "next/link"
import { UserMenu } from "@/components/user-menu"

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)
    setError("")
    setMessage("")

    // Validation
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters")
      setIsChangingPassword(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      setIsChangingPassword(false)
      return
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password")
      setIsChangingPassword(false)
      return
    }

    try {
      // In a real app, you would make an API call to change the password
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      setError("Failed to change password. Please try again.")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const isOAuthUser = session.provider === "google" || session.provider === "github"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Account Information</span>
              </CardTitle>
              <CardDescription>
                Your account details and authentication method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    value={session.user.name || session.user.email?.split('@')[0] || ""} 
                    disabled 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={session.user.email || ""} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Authentication Method</Label>
                <div className="flex items-center space-x-2">
                  <Input 
                    value={
                      session.provider === "google" ? "Google OAuth" :
                      session.provider === "github" ? "GitHub OAuth" :
                      "Email & Password"
                    } 
                    disabled 
                  />
                  {isOAuthUser && (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">Verified</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Section */}
          {!isOAuthUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Change Password</span>
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent>
                {message && (
                  <Alert className="mb-4">
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>{message}</AlertDescription>
                  </Alert>
                )}
                
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter your new password (min 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                      minLength={6}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword}
                    className="w-full md:w-auto"
                  >
                    {isChangingPassword ? "Changing Password..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* OAuth Users Info */}
          {isOAuthUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Password Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    You're signed in with {session.provider === "google" ? "Google" : "GitHub"}. 
                    Password changes are managed through your {session.provider === "google" ? "Google" : "GitHub"} account.
                    To change your password, please visit your {session.provider === "google" ? "Google" : "GitHub"} account settings.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trash2 className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
              <CardDescription>
                Manage your account data and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Export Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download all your job tracking data in JSON format
                  </p>
                  <Button variant="outline" onClick={() => {
                    const userEmail = session.user.email || 'user'
                    const jobsKey = `jobs_${userEmail}`
                    const profileKey = `profile_${userEmail}`
                    
                    const jobs = localStorage.getItem(jobsKey)
                    const profile = localStorage.getItem(profileKey)
                    
                    const exportData = {
                      jobs: jobs ? JSON.parse(jobs) : [],
                      profile: profile ? JSON.parse(profile) : {},
                      exportDate: new Date().toISOString()
                    }
                    
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `job-tracker-data-${new Date().toISOString().split('T')[0]}.json`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                  }}>
                    Export My Data
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2 text-destructive">Clear All Data</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    This will permanently delete all your jobs and profile data. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={() => {
                    if (confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
                      const userEmail = session.user.email || 'user'
                      localStorage.removeItem(`jobs_${userEmail}`)
                      localStorage.removeItem(`profile_${userEmail}`)
                      alert("All data has been cleared.")
                      router.push("/dashboard")
                    }
                  }}>
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

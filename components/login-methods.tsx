"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Chrome, Github, Mail, User } from 'lucide-react'

interface LoginMethodsProps {
  isLoading: boolean
  loadingProvider: string | null
  onProviderChange: (provider: string | null) => void
}

export function LoginMethods({ isLoading, loadingProvider, onProviderChange }: LoginMethodsProps) {
  const handleGoogleLogin = async () => {
    onProviderChange("google")
    try {
      // Try mock Google first for demo
      const result = await signIn("google-demo", { redirect: false })
      if (result?.ok) {
        window.location.href = "/dashboard"
      } else {
        // Fallback to real Google OAuth
        signIn("google", { callbackUrl: "/dashboard" })
      }
    } catch (error) {
      console.error("Google sign in error:", error)
      signIn("google", { callbackUrl: "/dashboard" })
    } finally {
      onProviderChange(null)
    }
  }

  const handleGithubLogin = () => {
    onProviderChange("github")
    signIn("github", { callbackUrl: "/dashboard" })
  }

  const handleQuickDemo = async () => {
    onProviderChange("demo")
    try {
      const result = await signIn("credentials", {
        email: "demo@example.com",
        password: "demo",
        redirect: false,
      })
      if (result?.ok) {
        window.location.href = "/dashboard"
      }
    } catch (error) {
      console.error("Demo login error:", error)
    } finally {
      onProviderChange(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Google Login */}
      <Button
        onClick={handleGoogleLogin}
        variant="outline"
        className="w-full relative"
        size="lg"
        disabled={isLoading}
      >
        <Chrome className="h-5 w-5 mr-3 text-red-500" />
        {loadingProvider === "google" ? "Signing in..." : "Continue with Google"}
        <span className="absolute right-3 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
          Popular
        </span>
      </Button>

      {/* GitHub Login */}
      <Button
        onClick={handleGithubLogin}
        variant="outline"
        className="w-full"
        size="lg"
        disabled={isLoading}
      >
        <Github className="h-5 w-5 mr-3" />
        {loadingProvider === "github" ? "Signing in..." : "Continue with GitHub"}
      </Button>

      {/* Quick Demo */}
      <Button
        onClick={handleQuickDemo}
        className="w-full"
        size="lg"
        disabled={isLoading}
      >
        <User className="h-4 w-4 mr-2" />
        {loadingProvider === "demo" ? "Signing in..." : "Try Demo (No signup)"}
      </Button>
    </div>
  )
}

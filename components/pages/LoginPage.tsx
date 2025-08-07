"use client";

import { signIn, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Mail,
  Chrome,
  Github,
  AlertCircle,
  UserPlus,
} from "lucide-react";
import Link from "next/link";

export default function LoginPage({ err }: { err: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("signin");
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    // Check for error in URL params
    const errorParam = err;
    if (errorParam) {
      setError("Authentication failed. Please try again.");
    }
  }, [router, err]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoadingProvider("credentials");
    setError("");

    if (activeTab === "signup") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        setLoadingProvider(null);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setIsLoading(false);
        setLoadingProvider(null);
        return;
      }
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        action: activeTab,
        redirect: false,
      });

      if (result?.ok) {
        router.push("/dashboard");
      } else {
        if (activeTab === "signup") {
          setError("Failed to create account. User may already exist.");
        } else {
          setError("Invalid email or password. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoadingProvider("google");
    setError("");

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign in error:", error);
      setError("Google sign in failed. Please try again.");
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleGitHubLogin = async () => {
    setIsLoading(true);
    setLoadingProvider("github");
    setError("");

    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("GitHub sign in error:", error);
      setError("GitHub sign in failed. Please try again.");
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Briefcase className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">
              Job Tracker
            </span>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Track your job applications with ease
          </p>
        </div>

        <Card>
          <CardHeader>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="signin" className="space-y-4">
                <CardDescription>
                  Sign in to your existing account
                </CardDescription>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    <Chrome className="h-5 w-5 mr-3 text-red-500" />
                    {loadingProvider === "google"
                      ? "Signing in..."
                      : "Continue with Google"}
                  </Button>

                  <Button
                    onClick={handleGitHubLogin}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    <Github className="h-5 w-5 mr-3" />
                    {loadingProvider === "github"
                      ? "Signing in..."
                      : "Continue with GitHub"}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                {/* Email Login Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    {loadingProvider === "credentials"
                      ? "Signing in..."
                      : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <CardDescription>
                  Create a new account to get started
                </CardDescription>

                {/* Social Login Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    <Chrome className="h-5 w-5 mr-3 text-red-500" />
                    {loadingProvider === "google"
                      ? "Signing up..."
                      : "Sign up with Google"}
                  </Button>

                  <Button
                    onClick={handleGitHubLogin}
                    variant="outline"
                    className="w-full"
                    size="lg"
                    disabled={isLoading}
                  >
                    <Github className="h-5 w-5 mr-3" />
                    {loadingProvider === "github"
                      ? "Signing up..."
                      : "Sign up with GitHub"}
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or create account with email
                    </span>
                  </div>
                </div>

                {/* Email Signup Form */}
                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                    size="lg"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {loadingProvider === "credentials"
                      ? "Creating account..."
                      : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-primary hover:text-primary/80"
              >
                ← Back to homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

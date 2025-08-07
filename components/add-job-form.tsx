"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, ArrowLeft, Upload, X, Image } from 'lucide-react'
import Link from "next/link"
import { RichTextEditor } from "./rich-text-editor"
import { FileUpload } from "./file-upload"

export function AddJobForm() {
  const router = useRouter()
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    companyWebsite: "",
    jobUrl: "",
    offeredSalary: "",
    expectedSalary: "",
    deadline: "",
    notes: "",
    status: "wishlist" as "wishlist" | "applied"
  })
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [companyImages, setCompanyImages] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const userEmail = session?.user?.email || 'demo_user'
    
    // Create new job object
    const newJob = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      userId: userEmail,
      companyLogo: companyLogo ? URL.createObjectURL(companyLogo) : "",
      companyImages: companyImages.map(img => URL.createObjectURL(img))
    }
    
    // Get existing jobs from localStorage for this user
    const userKey = `jobs_${userEmail}`
    const existingJobs = JSON.parse(localStorage.getItem(userKey) || "[]")
    
    // Add new job and save back to localStorage
    const updatedJobs = [...existingJobs, newJob]
    localStorage.setItem(userKey, JSON.stringify(updatedJobs))
    
    // Redirect to dashboard
    router.push("/dashboard")
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleLogoUpload = (file: File) => {
    setCompanyLogo(file)
  }

  const handleImagesUpload = (files: File[]) => {
    setCompanyImages(prev => [...prev, ...files])
  }

  const removeImage = (index: number) => {
    setCompanyImages(prev => prev.filter((_, i) => i !== index))
  }

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
                <h1 className="text-xl font-semibold text-gray-900">Add New Job</h1>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Job Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Company Logo */}
              <div className="space-y-2">
                <Label>Company Logo (Optional)</Label>
                <FileUpload
                  onFileSelect={handleLogoUpload}
                  accept="image/*"
                  maxFiles={1}
                  currentFile={companyLogo}
                />
                {companyLogo && (
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <Image className="h-4 w-4" />
                    <span className="text-sm">{companyLogo.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCompanyLogo(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Company Images */}
              <div className="space-y-2">
                <Label>Company Images (Optional)</Label>
                <FileUpload
                  onFileSelect={(files) => handleImagesUpload(Array.isArray(files) ? files : [files])}
                  accept="image/*"
                  maxFiles={5}
                  multiple
                />
                {companyImages.length > 0 && (
                  <div className="space-y-2">
                    {companyImages.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                        <Image className="h-4 w-4" />
                        <span className="text-sm">{image.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* URLs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <Input
                    id="companyWebsite"
                    type="url"
                    placeholder="https://company.com"
                    value={formData.companyWebsite}
                    onChange={(e) => handleChange("companyWebsite", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jobUrl">Job Listing URL</Label>
                  <Input
                    id="jobUrl"
                    type="url"
                    placeholder="https://company.com/jobs/123"
                    value={formData.jobUrl}
                    onChange={(e) => handleChange("jobUrl", e.target.value)}
                  />
                </div>
              </div>

              {/* Salary Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="offeredSalary">Offered Salary</Label>
                  <Input
                    id="offeredSalary"
                    placeholder="$100,000 - $120,000"
                    value={formData.offeredSalary}
                    onChange={(e) => handleChange("offeredSalary", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">Expected Salary</Label>
                  <Input
                    id="expectedSalary"
                    placeholder="$110,000"
                    value={formData.expectedSalary}
                    onChange={(e) => handleChange("expectedSalary", e.target.value)}
                  />
                </div>
              </div>

              {/* Deadline and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="deadline">Application Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wishlist">To Apply</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rich Text Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Job Description & Notes</Label>
                <RichTextEditor
                  value={formData.notes}
                  onChange={(value) => handleChange("notes", value)}
                  placeholder="Add detailed notes about this job opportunity..."
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-4 pt-6">
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit">Add Job</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

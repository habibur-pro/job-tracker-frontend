"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Briefcase, ArrowLeft, Upload, FileText, Trash2, Download, Zap, User, Mail, Phone, MapPin, Calendar, Building, GraduationCap, Award, FileDown } from 'lucide-react'
import Link from "next/link"
import { UserMenu } from "./user-menu"
import { ResumeUpload } from "./resume-upload"
import { SkillsExtractor } from "./skills-extractor"

interface WorkExperience {
  id: string
  jobTitle: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface Education {
  id: string
  degree: string
  institution: string
  location: string
  graduationDate: string
  gpa?: string
  description: string
}

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string
  startDate: string
  endDate: string
}

interface Certification {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
}

interface UserProfile {
  // Personal Information
  fullName: string
  email: string
  phone: string
  location: string
  linkedinUrl: string
  githubUrl: string
  portfolioUrl: string
  
  // Professional Summary
  professionalSummary: string
  
  // Skills
  skills: string[]
  
  // Work Experience
  workExperience: WorkExperience[]
  
  // Education
  education: Education[]
  
  // Projects
  projects: Project[]
  
  // Certifications
  certifications: Certification[]
  
  // Languages
  languages: string[]
  
  // Resume File
  resumeFile?: File
  resumeText?: string
  lastUpdated: string
}

export function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    professionalSummary: "",
    skills: [],
    workExperience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    lastUpdated: ""
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [formData, setFormData] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    professionalSummary: "",
    skills: [],
    workExperience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    lastUpdated: ""
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.email) {
      const profileKey = `profile_${session.user.email}`
      const savedProfile = localStorage.getItem(profileKey)
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile)
        // Ensure all arrays exist with default empty arrays and are actually arrays
        const safeProfile = {
          fullName: parsedProfile.fullName || "",
          email: parsedProfile.email || "",
          phone: parsedProfile.phone || "",
          location: parsedProfile.location || "",
          linkedinUrl: parsedProfile.linkedinUrl || "",
          githubUrl: parsedProfile.githubUrl || "",
          portfolioUrl: parsedProfile.portfolioUrl || "",
          professionalSummary: parsedProfile.professionalSummary || "",
          skills: Array.isArray(parsedProfile.skills) ? parsedProfile.skills : [],
          workExperience: Array.isArray(parsedProfile.workExperience) ? parsedProfile.workExperience : [],
          education: Array.isArray(parsedProfile.education) ? parsedProfile.education : [],
          projects: Array.isArray(parsedProfile.projects) ? parsedProfile.projects : [],
          certifications: Array.isArray(parsedProfile.certifications) ? parsedProfile.certifications : [],
          languages: Array.isArray(parsedProfile.languages) ? parsedProfile.languages : [],
          lastUpdated: parsedProfile.lastUpdated || "",
          resumeFile: parsedProfile.resumeFile,
          resumeText: parsedProfile.resumeText
        }
        setProfile(safeProfile)
        setFormData(safeProfile)
      } else {
        // Initialize with session data if available
        const initialData = {
          fullName: session.user.name || "",
          email: session.user.email || "",
          phone: "",
          location: "",
          linkedinUrl: "",
          githubUrl: "",
          portfolioUrl: "",
          professionalSummary: "",
          skills: [],
          workExperience: [],
          education: [],
          projects: [],
          certifications: [],
          languages: [],
          lastUpdated: ""
        }
        setProfile(initialData)
        setFormData(initialData)
      }
    }
  }, [session])

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

  const saveProfile = (updatedProfile: UserProfile) => {
    if (session?.user?.email) {
      const profileKey = `profile_${session.user.email}`
      const profileToSave = {
        ...updatedProfile,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem(profileKey, JSON.stringify(profileToSave))
      setProfile(profileToSave)
    }
  }

  const handleResumeUpload = async (file: File) => {
    setIsAnalyzing(true)
    
    try {
      // Extract comprehensive data from resume
      const resumeData = await extractComprehensiveDataFromPDF(file)
      
      const updatedProfile = {
        ...profile,
        ...resumeData,
        resumeFile: file,
        // Ensure skills is always an array
        skills: [...new Set([...(profile.skills || []), ...(resumeData.skills || [])])]
      }
      
      setFormData(updatedProfile)
      saveProfile(updatedProfile)
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error("Error processing resume:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = formData.skills.filter(skill => skill !== skillToRemove)
    const updatedFormData = { ...formData, skills: updatedSkills }
    setFormData(updatedFormData)
    saveProfile(updatedFormData)
  }

  const addSkill = (newSkill: string) => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      const updatedSkills = [...formData.skills, newSkill]
      const updatedFormData = { ...formData, skills: updatedSkills }
      setFormData(updatedFormData)
      saveProfile(updatedFormData)
    }
  }

  const handleSave = () => {
    saveProfile(formData)
    setHasUnsavedChanges(false)
  }

  const updateFormField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const addWorkExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: ""
    }
    const currentExperience = Array.isArray(formData.workExperience) ? formData.workExperience : []
    updateFormField('workExperience', [...currentExperience, newExperience])
  }

  const updateWorkExperience = (id: string, field: keyof WorkExperience, value: any) => {
    const currentExperience = Array.isArray(formData.workExperience) ? formData.workExperience : []
    const updated = currentExperience.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    )
    updateFormField('workExperience', updated)
  }

  const removeWorkExperience = (id: string) => {
    const currentExperience = Array.isArray(formData.workExperience) ? formData.workExperience : []
    const updated = currentExperience.filter(exp => exp.id !== id)
    updateFormField('workExperience', updated)
  }

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      location: "",
      graduationDate: "",
      gpa: "",
      description: ""
    }
    const currentEducation = Array.isArray(formData.education) ? formData.education : []
    updateFormField('education', [...currentEducation, newEducation])
  }

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    const currentEducation = Array.isArray(formData.education) ? formData.education : []
    const updated = currentEducation.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    )
    updateFormField('education', updated)
  }

  const removeEducation = (id: string) => {
    const currentEducation = Array.isArray(formData.education) ? formData.education : []
    const updated = currentEducation.filter(edu => edu.id !== id)
    updateFormField('education', updated)
  }

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: [],
      url: "",
      startDate: "",
      endDate: ""
    }
    const currentProjects = Array.isArray(formData.projects) ? formData.projects : []
    updateFormField('projects', [...currentProjects, newProject])
  }

  const updateProject = (id: string, field: keyof Project, value: any) => {
    const currentProjects = Array.isArray(formData.projects) ? formData.projects : []
    const updated = currentProjects.map(proj => 
      proj.id === id ? { ...proj, [field]: value } : proj
    )
    updateFormField('projects', updated)
  }

  const removeProject = (id: string) => {
    const currentProjects = Array.isArray(formData.projects) ? formData.projects : []
    const updated = currentProjects.filter(proj => proj.id !== id)
    updateFormField('projects', updated)
  }

  const downloadResume = () => {
    // Create resume content from profile data
    const resumeContent = generateResumeContent(formData)
    
    // Create and download the resume file
    const blob = new Blob([resumeContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${formData.fullName || 'Resume'}_Resume.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const generateResumeContent = (profile: UserProfile): string => {
    let content = ''
    
    // Header
    content += `${profile.fullName}\n`
    content += `${profile.email} | ${profile.phone} | ${profile.location}\n`
    if (profile.linkedinUrl) content += `LinkedIn: ${profile.linkedinUrl}\n`
    if (profile.githubUrl) content += `GitHub: ${profile.githubUrl}\n`
    if (profile.portfolioUrl) content += `Portfolio: ${profile.portfolioUrl}\n`
    content += '\n'
    
    // Professional Summary
    if (profile.professionalSummary) {
      content += 'PROFESSIONAL SUMMARY\n'
      content += '===================\n'
      content += `${profile.professionalSummary}\n\n`
    }
    
    // Skills
    if (profile.skills.length > 0) {
      content += 'TECHNICAL SKILLS\n'
      content += '================\n'
      content += `${profile.skills.join(', ')}\n\n`
    }
    
    // Work Experience
    if (Array.isArray(profile.workExperience) && profile.workExperience.length > 0) {
      content += 'WORK EXPERIENCE\n'
      content += '===============\n'
      profile.workExperience.forEach(exp => {
        content += `${exp.jobTitle} | ${exp.company} | ${exp.location}\n`
        const endDate = exp.current ? 'Present' : exp.endDate
        content += `${exp.startDate} - ${endDate}\n`
        if (exp.description) {
          content += `${exp.description}\n`
        }
        content += '\n'
      })
    }
    
    // Education
    if (Array.isArray(profile.education) && profile.education.length > 0) {
      content += 'EDUCATION\n'
      content += '=========\n'
      profile.education.forEach(edu => {
        content += `${edu.degree} | ${edu.institution} | ${edu.location}\n`
        content += `Graduated: ${edu.graduationDate}`
        if (edu.gpa) content += ` | GPA: ${edu.gpa}`
        content += '\n'
        if (edu.description) {
          content += `${edu.description}\n`
        }
        content += '\n'
      })
    }
    
    // Projects
    if (Array.isArray(profile.projects) && profile.projects.length > 0) {
      content += 'PROJECTS\n'
      content += '========\n'
      profile.projects.forEach(project => {
        content += `${project.name}\n`
        if (project.url) content += `URL: ${project.url}\n`
        content += `${project.startDate} - ${project.endDate}\n`
        if (project.technologies.length > 0) {
          content += `Technologies: ${project.technologies.join(', ')}\n`
        }
        if (project.description) {
          content += `${project.description}\n`
        }
        content += '\n'
      })
    }
    
    return content
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
                <h1 className="text-xl font-semibold text-gray-900">Complete Profile</h1>
              </div>
            </div>
            <UserMenu />
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Resume Upload Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Resume Upload</span>
              </CardTitle>
              <CardDescription>
                Upload your resume to automatically populate all profile fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile.resumeFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{profile.resumeFile.name}</p>
                        <p className="text-sm text-green-700">
                          Uploaded {profile.lastUpdated ? new Date(profile.lastUpdated).toLocaleDateString() : 'recently'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          const updatedProfile = { ...profile, resumeFile: undefined, resumeText: undefined }
                          saveProfile(updatedProfile)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <ResumeUpload onFileUpload={handleResumeUpload} isAnalyzing={isAnalyzing} />
                </div>
              ) : (
                <ResumeUpload onFileUpload={handleResumeUpload} isAnalyzing={isAnalyzing} />
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => updateFormField('fullName', e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormField('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormField('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormField('location', e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                  <Input
                    id="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={(e) => updateFormField('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    value={formData.githubUrl}
                    onChange={(e) => updateFormField('githubUrl', e.target.value)}
                    placeholder="https://github.com/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={(e) => updateFormField('portfolioUrl', e.target.value)}
                    placeholder="https://johndoe.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Professional Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="professionalSummary">Summary</Label>
                <Textarea
                  id="professionalSummary"
                  placeholder="Write a brief professional summary highlighting your key skills and experience..."
                  value={formData.professionalSummary}
                  onChange={(e) => updateFormField('professionalSummary', e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Skills Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Skills & Technologies</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SkillsExtractor 
                skills={formData.skills}
                onAddSkill={addSkill}
                onRemoveSkill={removeSkill}
              />
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Work Experience</span>
                </CardTitle>
                <Button onClick={addWorkExperience} variant="outline" size="sm">
                  Add Experience
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.isArray(formData.workExperience) && formData.workExperience.map((exp, index) => (
                <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Experience #{index + 1}</h4>
                    <Button 
                      onClick={() => removeWorkExperience(exp.id)}
                      variant="destructive" 
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input
                        value={exp.jobTitle}
                        onChange={(e) => updateWorkExperience(exp.id, 'jobTitle', e.target.value)}
                        placeholder="Senior Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        value={exp.company}
                        onChange={(e) => updateWorkExperience(exp.id, 'company', e.target.value)}
                        placeholder="Tech Corp Inc."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={exp.location}
                        onChange={(e) => updateWorkExperience(exp.id, 'location', e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={exp.startDate}
                        onChange={(e) => updateWorkExperience(exp.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={exp.endDate}
                        onChange={(e) => updateWorkExperience(exp.id, 'endDate', e.target.value)}
                        disabled={exp.current}
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`current-${exp.id}`}
                      checked={exp.current}
                      onChange={(e) => updateWorkExperience(exp.id, 'current', e.target.checked)}
                    />
                    <Label htmlFor={`current-${exp.id}`}>Currently working here</Label>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={exp.description}
                      onChange={(e) => updateWorkExperience(exp.id, 'description', e.target.value)}
                      placeholder="Describe your responsibilities and achievements..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              {(!Array.isArray(formData.workExperience) || formData.workExperience.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No work experience added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <GraduationCap className="h-5 w-5" />
                  <span>Education</span>
                </CardTitle>
                <Button onClick={addEducation} variant="outline" size="sm">
                  Add Education
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.isArray(formData.education) && formData.education.map((edu, index) => (
                <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Education #{index + 1}</h4>
                    <Button 
                      onClick={() => removeEducation(edu.id)}
                      variant="destructive" 
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Degree</Label>
                      <Input
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        placeholder="Bachelor of Science in Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution</Label>
                      <Input
                        value={edu.institution}
                        onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                        placeholder="University of Technology"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input
                        value={edu.location}
                        onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                        placeholder="Boston, MA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Graduation Date</Label>
                      <Input
                        type="date"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>GPA (Optional)</Label>
                      <Input
                        value={edu.gpa || ''}
                        onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                        placeholder="3.8"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={edu.description}
                      onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                      placeholder="Relevant coursework, achievements, activities..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
              {(!Array.isArray(formData.education) || formData.education.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No education added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5" />
                  <span>Projects</span>
                </CardTitle>
                <Button onClick={addProject} variant="outline" size="sm">
                  Add Project
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Array.isArray(formData.projects) && formData.projects.map((project, index) => (
                <div key={project.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Project #{index + 1}</h4>
                    <Button 
                      onClick={() => removeProject(project.id)}
                      variant="destructive" 
                      size="sm"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        value={project.name}
                        onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                        placeholder="E-commerce Platform"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Project URL (Optional)</Label>
                      <Input
                        value={project.url || ''}
                        onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                        placeholder="https://github.com/johndoe/project"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={project.startDate}
                        onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={project.endDate}
                        onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Technologies Used</Label>
                    <Input
                      value={project.technologies.join(', ')}
                      onChange={(e) => updateProject(project.id, 'technologies', e.target.value.split(', ').filter(t => t.trim()))}
                      placeholder="React, Node.js, MongoDB, AWS"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={project.description}
                      onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                      placeholder="Describe the project, your role, and key achievements..."
                      rows={3}
                    />
                  </div>
                </div>
              ))}
              {(!Array.isArray(formData.projects) || formData.projects.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No projects added yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save and Download Buttons */}
          <div className="flex justify-end space-x-4">
            <Button 
              onClick={downloadResume}
              variant="outline"
              className="min-w-[140px]"
              size="lg"
              disabled={!formData.fullName && !formData.email} // Require at least basic info
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download Resume
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="min-w-[120px]"
              size="lg"
            >
              {hasUnsavedChanges ? "Save Changes" : "Saved"}
            </Button>
          </div>

          {/* Profile Completeness */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Completeness</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Badge variant={profile.fullName ? "default" : "secondary"}>
                    {profile.fullName ? "✓" : "○"} Personal Info
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant={profile.skills.length > 0 ? "default" : "secondary"}>
                    {profile.skills.length > 0 ? "✓" : "○"} Skills ({profile.skills.length})
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant={profile.workExperience.length > 0 ? "default" : "secondary"}>
                    {profile.workExperience.length > 0 ? "✓" : "○"} Experience ({profile.workExperience.length})
                  </Badge>
                </div>
                <div className="text-center">
                  <Badge variant={profile.education.length > 0 ? "default" : "secondary"}>
                    {profile.education.length > 0 ? "✓" : "○"} Education ({profile.education.length})
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Enhanced resume data extraction
async function extractComprehensiveDataFromPDF(file: File): Promise<Partial<UserProfile>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate comprehensive data extraction from PDF
      const extractedData: Partial<UserProfile> = {
        fullName: "John Doe",
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        linkedinUrl: "https://linkedin.com/in/johndoe",
        githubUrl: "https://github.com/johndoe",
        portfolioUrl: "https://johndoe.dev",
        
        professionalSummary: "Experienced Senior Software Engineer with 5+ years of expertise in full-stack development, specializing in React, Node.js, and cloud technologies. Proven track record of leading development teams and delivering scalable web applications.",
        
        skills: [
          'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'AWS', 
          'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Git', 'Agile'
        ],
        
        workExperience: [
          {
            id: '1',
            jobTitle: 'Senior Software Engineer',
            company: 'Tech Corp Inc.',
            location: 'San Francisco, CA',
            startDate: '2021-03-01',
            endDate: '',
            current: true,
            description: 'Led development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored junior developers and conducted code reviews.'
          },
          {
            id: '2',
            jobTitle: 'Full Stack Developer',
            company: 'StartupXYZ',
            location: 'San Francisco, CA',
            startDate: '2019-06-01',
            endDate: '2021-02-28',
            current: false,
            description: 'Built responsive web applications using React and Node.js. Integrated third-party APIs and payment systems. Collaborated with design team to implement pixel-perfect UI components.'
          }
        ],
        
        education: [
          {
            id: '1',
            degree: 'Bachelor of Science in Computer Science',
            institution: 'University of California, Berkeley',
            location: 'Berkeley, CA',
            graduationDate: '2019-05-15',
            gpa: '3.8',
            description: 'Relevant coursework: Data Structures, Algorithms, Software Engineering, Database Systems, Machine Learning'
          }
        ],
        
        projects: [
          {
            id: '1',
            name: 'E-commerce Platform',
            description: 'Built a full-stack e-commerce platform with React, Node.js, and MongoDB. Implemented features like user authentication, payment processing, and inventory management.',
            technologies: ['React', 'Node.js', 'MongoDB', 'Stripe API', 'AWS'],
            url: 'https://github.com/johndoe/ecommerce-platform',
            startDate: '2020-01-01',
            endDate: '2020-06-01'
          },
          {
            id: '2',
            name: 'Task Management App',
            description: 'Developed a collaborative task management application with real-time updates using Socket.io. Features include drag-and-drop interface, team collaboration, and progress tracking.',
            technologies: ['React', 'Socket.io', 'Express.js', 'PostgreSQL'],
            url: 'https://github.com/johndoe/task-manager',
            startDate: '2020-07-01',
            endDate: '2020-12-01'
          }
        ],
        
        certifications: [
          {
            id: '1',
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            issueDate: '2022-03-15',
            expiryDate: '2025-03-15',
            credentialId: 'AWS-SAA-123456'
          }
        ],
        
        languages: ['English (Native)', 'Spanish (Conversational)', 'French (Basic)'],
        
        resumeText: `
          John Doe
          Senior Software Engineer
          john.doe@email.com | +1 (555) 123-4567 | San Francisco, CA
          LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe
          
          PROFESSIONAL SUMMARY
          Experienced Senior Software Engineer with 5+ years of expertise in full-stack development...
          
          TECHNICAL SKILLS
          Languages: JavaScript, TypeScript, Python, SQL
          Frontend: React, Vue.js, HTML5, CSS3, Sass
          Backend: Node.js, Express.js, Django, REST APIs
          Databases: MongoDB, PostgreSQL, MySQL, Redis
          Cloud & DevOps: AWS, Docker, Kubernetes, CI/CD
          Tools: Git, Webpack, Jest, Agile/Scrum
          
          WORK EXPERIENCE
          Senior Software Engineer | Tech Corp Inc. | Mar 2021 - Present
          • Led development of microservices architecture serving 1M+ users
          • Implemented CI/CD pipelines reducing deployment time by 60%
          • Mentored junior developers and conducted code reviews
          
          Full Stack Developer | StartupXYZ | Jun 2019 - Feb 2021
          • Built responsive web applications using React and Node.js
          • Integrated third-party APIs and payment systems
          • Collaborated with design team to implement pixel-perfect UI components
          
          EDUCATION
          Bachelor of Science in Computer Science | UC Berkeley | 2019
          GPA: 3.8/4.0
          Relevant Coursework: Data Structures, Algorithms, Software Engineering
          
          PROJECTS
          E-commerce Platform | React, Node.js, MongoDB, AWS
          • Built full-stack platform with authentication and payment processing
          • Implemented inventory management and order tracking systems
          
          Task Management App | React, Socket.io, PostgreSQL
          • Developed collaborative app with real-time updates
          • Features drag-and-drop interface and team collaboration tools
          
          CERTIFICATIONS
          AWS Certified Solutions Architect | Amazon Web Services | 2022
        `
      }
      
      resolve(extractedData)
    }, 3000) // Simulate longer processing time for comprehensive extraction
  })
}

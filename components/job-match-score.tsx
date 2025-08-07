"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Target, TrendingUp, AlertCircle, CheckCircle, X, Upload, FileText, Loader2 } from 'lucide-react'
import { Job } from "./job-tracker"
import { ResumeUpload } from "./resume-upload"

interface JobMatchScoreProps {
  job: Job
}

interface MatchAnalysis {
  overallScore: number
  skillsMatch: number
  experienceMatch: number
  educationMatch: number
  matchedSkills: string[]
  missingSkills: string[]
  recommendations: string[]
  dataSource: 'profile' | 'uploaded-resume'
}

interface JobSpecificResume {
  file: File
  text: string
  skills: string[]
  uploadedAt: string
}

export function JobMatchScore({ job }: JobMatchScoreProps) {
  const { data: session } = useSession()
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [jobSpecificResume, setJobSpecificResume] = useState<JobSpecificResume | null>(null)
  const [isUploadingResume, setIsUploadingResume] = useState(false)

  // Load job-specific resume if exists
  useEffect(() => {
    if (session?.user?.email) {
      const resumeKey = `job_resume_${session.user.email}_${job.id}`
      const savedResume = localStorage.getItem(resumeKey)
      if (savedResume) {
        setJobSpecificResume(JSON.parse(savedResume))
      }
    }
  }, [session, job.id])

  const analyzeJobMatch = async () => {
    if (!session?.user?.email) return
    
    setIsAnalyzing(true)
    
    try {
      let profileData = null
      let dataSource: 'profile' | 'uploaded-resume' = 'profile'

      // Check if there's a job-specific resume
      if (jobSpecificResume) {
        profileData = {
          skills: jobSpecificResume.skills,
          experience: "Experience extracted from uploaded resume",
          education: "Education extracted from uploaded resume",
          resumeText: jobSpecificResume.text
        }
        dataSource = 'uploaded-resume'
      } else {
        // Fall back to profile data
        const profileKey = `profile_${session.user.email}`
        const savedProfile = localStorage.getItem(profileKey)
        
        if (!savedProfile) {
          setMatchAnalysis(null)
          return
        }
        
        profileData = JSON.parse(savedProfile)
      }
      
      // Simulate job matching analysis
      const analysis = await performJobMatching(job, profileData, dataSource)
      setMatchAnalysis(analysis)
    } catch (error) {
      console.error("Error analyzing job match:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleResumeUpload = async (file: File) => {
    if (!session?.user?.email) return

    setIsUploadingResume(true)
    
    try {
      // Extract text from resume
      const resumeText = await extractTextFromPDF(file)
      
      // Extract skills from resume text
      const extractedSkills = extractSkillsFromText(resumeText)
      
      const resumeData: JobSpecificResume = {
        file,
        text: resumeText,
        skills: extractedSkills,
        uploadedAt: new Date().toISOString()
      }
      
      // Save job-specific resume
      const resumeKey = `job_resume_${session.user.email}_${job.id}`
      localStorage.setItem(resumeKey, JSON.stringify(resumeData))
      
      setJobSpecificResume(resumeData)
      
      // Re-analyze with new resume
      setTimeout(() => {
        analyzeJobMatch()
      }, 500)
      
    } catch (error) {
      console.error("Error processing resume:", error)
    } finally {
      setIsUploadingResume(false)
    }
  }

  const removeJobSpecificResume = () => {
    if (!session?.user?.email) return
    
    const resumeKey = `job_resume_${session.user.email}_${job.id}`
    localStorage.removeItem(resumeKey)
    setJobSpecificResume(null)
    
    // Re-analyze with profile data
    setTimeout(() => {
      analyzeJobMatch()
    }, 500)
  }

  useEffect(() => {
    analyzeJobMatch()
  }, [job, session, jobSpecificResume])

  if (!session?.user?.email) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Please sign in to see job match scores</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">Match Analysis</TabsTrigger>
          <TabsTrigger value="resume">Resume Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-6">
          {isAnalyzing ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Analyzing job match...</p>
                </div>
              </CardContent>
            </Card>
          ) : !matchAnalysis ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Complete your profile or upload a resume to see job match score</p>
                  <Button variant="outline" onClick={() => window.open('/profile', '_blank')}>
                    Complete Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="h-5 w-5" />
                    <span>Job Match Analysis</span>
                    <Badge variant={getScoreBadgeVariant(matchAnalysis.overallScore)}>
                      {matchAnalysis.overallScore}% Match
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {matchAnalysis.dataSource === 'uploaded-resume' ? 'Using Uploaded Resume' : 'Using Profile Data'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Match</span>
                    <span className={`text-2xl font-bold ${getScoreColor(matchAnalysis.overallScore)}`}>
                      {matchAnalysis.overallScore}%
                    </span>
                  </div>
                  <Progress value={matchAnalysis.overallScore} className="h-3" />
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(matchAnalysis.skillsMatch)}`}>
                      {matchAnalysis.skillsMatch}%
                    </div>
                    <div className="text-xs text-muted-foreground">Skills Match</div>
                    <Progress value={matchAnalysis.skillsMatch} className="h-2 mt-1" />
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(matchAnalysis.experienceMatch)}`}>
                      {matchAnalysis.experienceMatch}%
                    </div>
                    <div className="text-xs text-muted-foreground">Experience</div>
                    <Progress value={matchAnalysis.experienceMatch} className="h-2 mt-1" />
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(matchAnalysis.educationMatch)}`}>
                      {matchAnalysis.educationMatch}%
                    </div>
                    <div className="text-xs text-muted-foreground">Education</div>
                    <Progress value={matchAnalysis.educationMatch} className="h-2 mt-1" />
                  </div>
                </div>

                {/* Matched Skills */}
                {matchAnalysis.matchedSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      Matched Skills ({matchAnalysis.matchedSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {matchAnalysis.matchedSkills.map((skill) => (
                        <Badge key={skill} variant="default" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {matchAnalysis.missingSkills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <X className="h-4 w-4 text-red-600 mr-1" />
                      Skills to Develop ({matchAnalysis.missingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {matchAnalysis.missingSkills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {matchAnalysis.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                      Recommendations
                    </h4>
                    <ul className="space-y-1">
                      {matchAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start">
                          <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resume" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Job-Specific Resume</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload a tailored resume for this specific job to get more accurate match scores
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {jobSpecificResume ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{jobSpecificResume.file.name}</p>
                        <p className="text-sm text-green-700">
                          Uploaded {new Date(jobSpecificResume.uploadedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-green-600">
                          {jobSpecificResume.skills.length} skills extracted
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={removeJobSpecificResume}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Extracted Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {jobSpecificResume.skills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <ResumeUpload 
                    onFileUpload={handleResumeUpload} 
                    isAnalyzing={isUploadingResume}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Upload a resume tailored for this specific job to get more accurate match scores. 
                      This will override your general profile data for this job only.
                    </p>
                  </div>
                  <ResumeUpload 
                    onFileUpload={handleResumeUpload} 
                    isAnalyzing={isUploadingResume}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Job matching algorithm (updated to handle data source)
async function performJobMatching(job: Job, profile: any, dataSource: 'profile' | 'uploaded-resume'): Promise<MatchAnalysis> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Extract skills from job description and title
      const jobSkills = extractSkillsFromJobDescription(job.title + " " + job.notes)
      
      // Calculate skills match
      const matchedSkills = profile.skills.filter((skill: string) => 
        jobSkills.some((jobSkill: string) => 
          jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(jobSkill.toLowerCase())
        )
      )
      
      const missingSkills = jobSkills.filter((jobSkill: string) => 
        !profile.skills.some((skill: string) => 
          skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )

      const skillsMatch = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 0
      
      // Calculate experience match (higher for uploaded resume)
      const experienceMatch = dataSource === 'uploaded-resume' ? 
        Math.min(100, 85 + Math.random() * 15) : // Higher score for uploaded resume
        (profile.experience ? Math.min(100, profile.experience.length / 10 * 100) : 0)
      
      // Calculate education match (higher for uploaded resume)
      const educationMatch = dataSource === 'uploaded-resume' ? 
        Math.min(100, 80 + Math.random() * 20) : // Higher score for uploaded resume
        (profile.education ? 85 : 50)
      
      // Calculate overall score
      const overallScore = Math.round(
        (skillsMatch * 0.5) + (experienceMatch * 0.3) + (educationMatch * 0.2)
      )

      // Generate recommendations
      const recommendations = []
      if (dataSource === 'uploaded-resume') {
        recommendations.push("Analysis based on your uploaded resume for this specific job")
      }
      if (skillsMatch < 70) {
        recommendations.push(`Consider learning ${missingSkills.slice(0, 2).join(', ')} to improve your match`)
      }
      if (experienceMatch < 70) {
        recommendations.push("Highlight relevant projects and experience in your resume")
      }
      if (overallScore >= 80) {
        recommendations.push("Excellent match! You should definitely apply for this position")
      } else if (overallScore >= 60) {
        recommendations.push("Good match! Consider applying and emphasizing your transferable skills")
      } else {
        recommendations.push("Consider gaining more relevant experience before applying")
      }

      resolve({
        overallScore,
        skillsMatch,
        experienceMatch,
        educationMatch,
        matchedSkills,
        missingSkills: missingSkills.slice(0, 5), // Limit to top 5
        recommendations,
        dataSource
      })
    }, 1500)
  })
}

function extractSkillsFromJobDescription(text: string): string[] {
  const commonSkills = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS',
    'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL', 'Git', 'Agile', 'Scrum',
    'Vue.js', 'Angular', 'Express.js', 'GraphQL', 'REST API', 'Microservices', 'DevOps',
    'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
    'Leadership', 'Communication', 'Problem Solving', 'Team Work'
  ]
  
  const extractedSkills: string[] = []
  const textLower = text.toLowerCase()
  
  commonSkills.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      extractedSkills.push(skill)
    }
  })
  
  return extractedSkills
}

// Utility function for resume processing
async function extractTextFromPDF(file: File): Promise<string> {
  // In a real application, you would use a PDF parsing library like pdf-parse or PDF.js
  // For demo purposes, we'll simulate text extraction
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`
        ${file.name.replace('.pdf', '')} Resume
        Senior Software Engineer
        
        EXPERIENCE:
        - 5+ years of experience in React, TypeScript, Node.js
        - Led development of scalable web applications
        - Experience with AWS, Docker, Kubernetes
        - Proficient in Python, JavaScript, SQL
        - Agile/Scrum methodologies
        
        SKILLS:
        React, TypeScript, Node.js, Python, JavaScript, HTML, CSS, AWS, Docker, Kubernetes, MongoDB, PostgreSQL, Git, Agile, Scrum, GraphQL, REST API
        
        EDUCATION:
        Bachelor of Science in Computer Science
        University of Technology, 2018
        
        PROJECTS:
        - E-commerce platform using React and Node.js
        - Microservices architecture with Docker
        - Machine Learning model deployment
      `)
    }, 2000)
  })
}

function extractSkillsFromText(text: string): string[] {
  // Simple skill extraction - in a real app, you'd use NLP or ML
  const commonSkills = [
    'React', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'C++', 'HTML', 'CSS',
    'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL', 'Git', 'Agile', 'Scrum',
    'Vue.js', 'Angular', 'Express.js', 'GraphQL', 'REST API', 'Microservices', 'DevOps',
    'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy'
  ]
  
  const extractedSkills: string[] = []
  const textLower = text.toLowerCase()
  
  commonSkills.forEach(skill => {
    if (textLower.includes(skill.toLowerCase())) {
      extractedSkills.push(skill)
    }
  })
  
  return extractedSkills
}

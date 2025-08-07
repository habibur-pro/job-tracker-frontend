"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, Loader2 } from 'lucide-react'

interface ResumeUploadProps {
  onFileUpload: (file: File) => void
  isAnalyzing: boolean
}

export function ResumeUpload({ onFileUpload, isAnalyzing }: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      onFileUpload(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === 'application/pdf') {
      onFileUpload(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  if (isAnalyzing) {
    return (
      <Card className="border-2 border-dashed border-primary/20">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyzing Resume</h3>
          <p className="text-sm text-muted-foreground text-center">
            Extracting skills and information from your resume...
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <Card 
        className={`border-2 border-dashed cursor-pointer transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Upload Your Resume</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Drag and drop your PDF resume here, or click to browse
          </p>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Choose PDF File
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Only PDF files are supported
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

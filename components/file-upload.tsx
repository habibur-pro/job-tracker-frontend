"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload } from 'lucide-react'

interface FileUploadProps {
  onFileSelect: (files: File | File[]) => void
  accept?: string
  maxFiles?: number
  multiple?: boolean
  currentFile?: File | null
}

export function FileUpload({ 
  onFileSelect, 
  accept = "*", 
  maxFiles = 1, 
  multiple = false,
  currentFile 
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      if (multiple) {
        onFileSelect(files.slice(0, maxFiles))
      } else {
        onFileSelect(files[0])
      }
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {currentFile ? "Change File" : `Upload ${multiple ? "Files" : "File"}`}
      </Button>
    </div>
  )
}

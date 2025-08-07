"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Calendar, DollarSign, Building, Edit, Save, X, ArrowRight, Trash2, Target } from 'lucide-react'
import { Job } from "./job-tracker"
import { JobMatchScore } from "./job-match-score"

interface JobDetailsModalProps {
  job: Job
  isOpen: boolean
  onClose: () => void
  onUpdate: (job: Job) => void
  onStatusChange: (jobId: string, newStatus: "wishlist" | "applied") => void
  onDelete: (jobId: string) => void
}

export function JobDetailsModal({ 
  job, 
  isOpen, 
  onClose, 
  onUpdate, 
  onStatusChange, 
  onDelete 
}: JobDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(job)

  const handleSave = () => {
    onUpdate(editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(job)
    setIsEditing(false)
  }

  const handleChange = (field: keyof Job, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleDelete = () => {
    onDelete(job.id)
    onClose()
  }

  const handleStatusChange = () => {
    const newStatus = job.status === "wishlist" ? "applied" : "wishlist"
    onStatusChange(job.id, newStatus)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <span>{isEditing ? "Edit Job" : "Job Details"}</span>
              <Badge variant={job.status === "applied" ? "default" : "secondary"}>
                {job.status === "applied" ? "Applied" : "To Apply"}
              </Badge>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleStatusChange}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    {job.status === "wishlist" ? "Mark Applied" : "Move to Wishlist"}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="match" className="flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>Match Score</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                {isEditing ? (
                  <Input
                    id="title"
                    value={editData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-semibold">{job.title}</h2>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                {isEditing ? (
                  <Input
                    id="company"
                    value={editData.company}
                    onChange={(e) => handleChange("company", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{job.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Company Website</Label>
                {isEditing ? (
                  <Input
                    id="companyWebsite"
                    type="url"
                    value={editData.companyWebsite}
                    onChange={(e) => handleChange("companyWebsite", e.target.value)}
                  />
                ) : (
                  job.companyWebsite && (
                    <a 
                      href={job.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Visit Company Website</span>
                    </a>
                  )
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobUrl">Job Listing</Label>
                {isEditing ? (
                  <Input
                    id="jobUrl"
                    type="url"
                    value={editData.jobUrl}
                    onChange={(e) => handleChange("jobUrl", e.target.value)}
                  />
                ) : (
                  job.jobUrl && (
                    <a 
                      href={job.jobUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Job Listing</span>
                    </a>
                  )
                )}
              </div>
            </div>

            {/* Salary Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offeredSalary">Offered Salary</Label>
                {isEditing ? (
                  <Input
                    id="offeredSalary"
                    value={editData.offeredSalary}
                    onChange={(e) => handleChange("offeredSalary", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{job.offeredSalary || "Not specified"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedSalary">Expected Salary</Label>
                {isEditing ? (
                  <Input
                    id="expectedSalary"
                    value={editData.expectedSalary}
                    onChange={(e) => handleChange("expectedSalary", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{job.expectedSalary || "Not specified"}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deadline and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                {isEditing ? (
                  <Input
                    id="deadline"
                    type="date"
                    value={editData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                  />
                ) : (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{job.deadline ? new Date(job.deadline).toLocaleDateString() : "Not specified"}</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={editData.status} 
                    onValueChange={(value: "wishlist" | "applied") => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wishlist">To Apply</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes & Description</Label>
              {isEditing ? (
                <Textarea
                  id="notes"
                  value={editData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={6}
                />
              ) : (
                <div className="bg-muted/50 rounded-md p-4 min-h-[100px]">
                  {job.notes ? (
                    <p className="whitespace-pre-wrap">{job.notes}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No notes added</p>
                  )}
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="text-sm text-muted-foreground border-t pt-4">
              <p>Added on {new Date(job.createdAt).toLocaleDateString()}</p>
            </div>
          </TabsContent>

          <TabsContent value="match" className="mt-6">
            <JobMatchScore job={job} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

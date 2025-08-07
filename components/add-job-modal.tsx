"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Job } from "./job-tracker"

interface AddJobModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (job: Omit<Job, "id" | "createdAt">) => void
}

export function AddJobModal({ isOpen, onClose, onAdd }: AddJobModalProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd(formData)
    setFormData({
      title: "",
      company: "",
      companyWebsite: "",
      jobUrl: "",
      offeredSalary: "",
      expectedSalary: "",
      deadline: "",
      notes: "",
      status: "wishlist"
    })
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Job</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Description</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this job opportunity..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Job</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

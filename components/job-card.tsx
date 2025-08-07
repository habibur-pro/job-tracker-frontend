"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, ExternalLink, Calendar, DollarSign, Eye, ArrowRight, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Job } from "./job-tracker"

interface JobCardProps {
  job: Job
  onStatusChange: (jobId: string, newStatus: "wishlist" | "applied") => void
  onDelete: (jobId: string) => void
  onView: () => void
}

export function JobCard({ job, onStatusChange, onDelete, onView }: JobCardProps) {
  const isDeadlineSoon = new Date(job.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg leading-tight">{job.title}</h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">{job.company}</p>
              <a 
                href={job.companyWebsite} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onView}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onStatusChange(job.id, job.status === "wishlist" ? "applied" : "wishlist")}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {job.status === "wishlist" ? "Mark as Applied" : "Move to Wishlist"}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(job.id)}
                className="text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Offered:</span>
          <span className="font-medium">{job.offeredSalary}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Deadline:</span>
          <span className={`font-medium ${isDeadlineSoon ? 'text-destructive' : ''}`}>
            {new Date(job.deadline).toLocaleDateString()}
          </span>
          {isDeadlineSoon && <Badge variant="destructive" className="text-xs">Soon</Badge>}
        </div>

        {job.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {job.notes}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex items-center justify-between w-full">
          <Badge variant={job.status === "applied" ? "default" : "secondary"}>
            {job.status === "applied" ? "Applied" : "To Apply"}
          </Badge>
          <Button variant="outline" size="sm" onClick={onView}>
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

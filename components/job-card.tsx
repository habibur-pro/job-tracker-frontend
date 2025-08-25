"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  ExternalLink,
  Calendar,
  DollarSign,
  Eye,
  ArrowRight,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IJob } from "@/types";
import { JobStatus } from "@/enum";
import { useRouter } from "next/navigation";

interface JobCardProps {
  job: IJob;
  onStatusChange: (jobId: string, newStatus: JobStatus) => void;
  onDelete: (jobId: string) => void;
}

export function JobCard({ job, onStatusChange, onDelete }: JobCardProps) {
  const router = useRouter();
  const isDeadlineSoon =
    new Date(job.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h3 className="font-semibold text-lg leading-tight">
              {job.jobTitle}
            </h3>
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">{job.companyName}</p>
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
              <DropdownMenuItem
                onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
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
          <span className="text-muted-foreground">Salary:</span>
          <span className="font-medium text-sm">{job.salary}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Expected:</span>
          <span className="font-medium text-sm">{job.expectedSalary}</span>
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Deadline:</span>
          <span
            className={`font-medium ${
              isDeadlineSoon ? "text-destructive" : ""
            }`}
          >
            {new Date(job.deadline).toLocaleDateString()}
          </span>
          {isDeadlineSoon && (
            <Badge variant="destructive" className="text-xs">
              Soon
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex items-center justify-between w-full">
          <Badge>{job.status}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
          >
            View Details
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

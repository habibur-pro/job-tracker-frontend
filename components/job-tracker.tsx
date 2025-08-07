"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Briefcase, CheckCircle, User } from 'lucide-react'
import { JobCard } from "./job-card"
import { JobDetailsModal } from "./job-details-modal"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { UserMenu } from "./user-menu"
import { useRouter } from "next/navigation"

export interface Job {
  id: string
  title: string
  company: string
  companyWebsite: string
  jobUrl: string
  offeredSalary: string
  expectedSalary: string
  deadline: string
  notes: string
  status: "wishlist" | "applied"
  createdAt: string
  userId?: string
}

const initialJobs: Job[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    companyWebsite: "https://techcorp.com",
    jobUrl: "https://techcorp.com/careers/senior-frontend",
    offeredSalary: "$120,000 - $150,000",
    expectedSalary: "$140,000",
    deadline: "2024-02-15",
    notes: "Great company culture, remote-first. Looking for React/Next.js expertise. Strong TypeScript skills required. Experience with AWS and Docker preferred.",
    status: "wishlist",
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "StartupXYZ",
    companyWebsite: "https://startupxyz.com",
    jobUrl: "https://startupxyz.com/jobs/fullstack",
    offeredSalary: "$100,000 - $130,000",
    expectedSalary: "$125,000",
    deadline: "2024-02-20",
    notes: "Early stage startup, equity options available. Need to prepare for technical interview. Python and JavaScript required. MongoDB experience is a plus.",
    status: "applied",
    createdAt: "2024-01-10"
  },
  {
    id: "3",
    title: "React Developer",
    company: "Digital Agency Pro",
    companyWebsite: "https://digitalagencypro.com",
    jobUrl: "https://digitalagencypro.com/careers/react-dev",
    offeredSalary: "$90,000 - $110,000",
    expectedSalary: "$105,000",
    deadline: "2024-02-10",
    notes: "Client-facing role, need strong communication skills. Portfolio review required. React, HTML, CSS, and JavaScript expertise needed.",
    status: "wishlist",
    createdAt: "2024-01-12"
  }
]

export function JobTracker() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [salaryFilter, setSalaryFilter] = useState("all")
  const [deadlineFilter, setDeadlineFilter] = useState("all")

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }
  }, [status, router])

  // Load jobs from localStorage on mount
  useEffect(() => {
    if (session?.user?.email) {
      const userKey = `jobs_${session.user.email}`
      const savedJobs = localStorage.getItem(userKey)
      if (savedJobs) {
        setJobs(JSON.parse(savedJobs))
      } else {
        // Set initial jobs for new users
        const userJobs = initialJobs.map(job => ({ 
          ...job, 
          userId: session.user.email 
        }))
        setJobs(userJobs)
        localStorage.setItem(userKey, JSON.stringify(userJobs))
      }
    }
  }, [session])

  // Save jobs to localStorage whenever jobs change
  useEffect(() => {
    if (session?.user?.email && jobs.length > 0) {
      const userKey = `jobs_${session.user.email}`
      localStorage.setItem(userKey, JSON.stringify(jobs))
    }
  }, [jobs, session])

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

  const addJob = (newJob: Omit<Job, "id" | "createdAt">) => {
    const job: Job = {
      ...newJob,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      userId: session.user.email || ''
    }
    setJobs([...jobs, job])
  }

  const updateJobStatus = (jobId: string, newStatus: "wishlist" | "applied") => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ))
  }

  const deleteJob = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId))
  }

  const updateJob = (updatedJob: Job) => {
    setJobs(jobs.map(job => job.id === updatedJob.id ? updatedJob : job))
  }

  const filterJobs = (jobList: Job[]) => {
    return jobList.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSalary = salaryFilter === "" || salaryFilter === "all" || 
        (salaryFilter === "100k+" && parseInt(job.offeredSalary.replace(/[^0-9]/g, '')) >= 100000) ||
        (salaryFilter === "120k+" && parseInt(job.offeredSalary.replace(/[^0-9]/g, '')) >= 120000) ||
        (salaryFilter === "150k+" && parseInt(job.offeredSalary.replace(/[^0-9]/g, '')) >= 150000)

      const matchesDeadline = deadlineFilter === "" || deadlineFilter === "all" ||
        (deadlineFilter === "week" && new Date(job.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) ||
        (deadlineFilter === "month" && new Date(job.deadline) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

      return matchesSearch && matchesSalary && matchesDeadline
    })
  }

  const wishlistJobs = filterJobs(jobs.filter(job => job.status === "wishlist"))
  const appliedJobs = filterJobs(jobs.filter(job => job.status === "applied"))

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900">My Job Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button variant="outline" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Button>
              </Link>
              <Link href="/add-job">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Add New Job</span>
                </Button>
              </Link>
              <UserMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome, {session.user.name || session.user.email?.split('@')[0]}!
              </h2>
              <p className="text-sm text-gray-600">
                You have {jobs.length} jobs tracked • {wishlistJobs.length} to apply • {appliedJobs.length} applied
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="hidden sm:flex">
                {session.provider === "google" && "Google Account"}
                {session.provider === "github" && "GitHub Account"}
                {session.provider === "credentials" && "Email Account"}
              </Badge>
              <Link href="/profile">
                <Button variant="outline" size="sm">
                  Complete Profile for Match Scores
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search jobs or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={salaryFilter} onValueChange={setSalaryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Salary filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All salaries</SelectItem>
              <SelectItem value="100k+">$100k+</SelectItem>
              <SelectItem value="120k+">$120k+</SelectItem>
              <SelectItem value="150k+">$150k+</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Deadline filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All deadlines</SelectItem>
              <SelectItem value="week">This week</SelectItem>
              <SelectItem value="month">This month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Lists */}
        <Tabs defaultValue="wishlist" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="wishlist" className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4" />
              <span>Jobs to Apply ({wishlistJobs.length})</span>
            </TabsTrigger>
            <TabsTrigger value="applied" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Applied Jobs ({appliedJobs.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist" className="space-y-4">
            {wishlistJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs in your wishlist</h3>
                <p className="text-gray-500 mb-4">Start by adding some jobs you want to apply to.</p>
                <Link href="/add-job">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {wishlistJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onStatusChange={updateJobStatus}
                    onDelete={deleteJob}
                    onView={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applied" className="space-y-4">
            {appliedJobs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                <p className="text-gray-500">Jobs you apply to will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appliedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onStatusChange={updateJobStatus}
                    onDelete={deleteJob}
                    onView={() => setSelectedJob(job)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={updateJob}
          onStatusChange={updateJobStatus}
          onDelete={deleteJob}
        />
      )}
    </div>
  )
}

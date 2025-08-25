"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  CheckCircle,
  User,
  XCircle,
} from "lucide-react";
import { JobCard } from "./job-card";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserMenu } from "./user-menu";
import { useRouter } from "next/navigation";
import { useGetMyJobsQuery } from "@/redux/api/jobApi";
import { IJob } from "@/types";
import { JobStatus } from "@/enum";

export function JobTracker() {
  const { data: session, status } = useSession();
  const { data: jobRes, isLoading } = useGetMyJobsQuery("");
  const jobs: IJob[] = jobRes?.data || [];
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [salaryFilter, setSalaryFilter] = useState<string>("all");
  const [deadlineFilter, setDeadlineFilter] = useState<string>("all");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) return null;

  // Helper functions
  const updateJobStatus = (jobId: string, newStatus: JobStatus) => {
    const updated = jobs.map((job) =>
      job.id === jobId ? { ...job, status: newStatus } : job
    );
    // update in store if needed
  };

  const deleteJob = (jobId: string) => {
    const updated = jobs.filter((job) => job.id !== jobId);
    // update in store if needed
  };

  const updateJob = (updatedJob: IJob) => {
    const updated = jobs.map((job) =>
      job.id === updatedJob.id ? updatedJob : job
    );
    // update in store if needed
  };

  const filterJobs = (jobList: IJob[]): IJob[] => {
    return jobList.filter((job) => {
      const matchesSearch =
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchTerm.toLowerCase());

      const numericSalary = parseInt(job.salary.replace(/[^0-9]/g, ""));
      const matchesSalary =
        salaryFilter === "all" ||
        (salaryFilter === "100k+" && numericSalary >= 100000) ||
        (salaryFilter === "120k+" && numericSalary >= 120000) ||
        (salaryFilter === "150k+" && numericSalary >= 150000);

      const matchesDeadline =
        deadlineFilter === "all" ||
        (deadlineFilter === "week" &&
          new Date(job.deadline) <=
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) ||
        (deadlineFilter === "month" &&
          new Date(job.deadline) <=
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));

      return matchesSearch && matchesSalary && matchesDeadline;
    });
  };

  const listedJobs = filterJobs(
    jobs.filter((job) => job.status === JobStatus.LISTED)
  );
  const appliedJobs = filterJobs(
    jobs.filter(
      (job) =>
        job.status !== JobStatus.LISTED && job.status !== JobStatus.REJECTED
    )
  );
  const rejectedJobs = filterJobs(
    jobs.filter((job) => job.status === JobStatus.REJECTED)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-gray-900">
                My Job Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/profile">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2"
                >
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome,{" "}
              {session.user?.name || session.user?.email?.split("@")[0]}!
            </h2>
            <p className="text-sm text-gray-600">
              You have {jobs.length} jobs tracked • {listedJobs.length} to apply
              • {appliedJobs.length} applied
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
          <TabsList className="grid w-full grid-cols-3 flex-wrap mb-6 rounded-lg bg-muted p-1">
            <TabsTrigger
              value="wishlist"
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <Briefcase className="h-4 w-4" />
              <span className="truncate">
                Jobs to Apply ({listedJobs.length})
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="applied"
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="truncate">
                Applied Jobs ({appliedJobs.length})
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="rejected"
              className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md"
            >
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="truncate">
                Rejected Jobs ({rejectedJobs.length})
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wishlist" className="space-y-4">
            {listedJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No jobs in your wishlist
                </h3>
                <p className="text-gray-500 mb-4">
                  Start by adding some jobs you want to apply to.
                </p>
                <Link href="/add-job">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {listedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onStatusChange={updateJobStatus}
                    onDelete={deleteJob}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applied" className="space-y-4">
            {appliedJobs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No applications yet
                </h3>
                <p className="text-gray-500">
                  Jobs you apply to will appear here.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {appliedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onStatusChange={updateJobStatus}
                    onDelete={deleteJob}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedJobs.length === 0 ? (
              <div className="text-center py-12">
                <XCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No rejected jobs
                </h3>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rejectedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onStatusChange={updateJobStatus}
                    onDelete={deleteJob}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ExternalLink,
  Calendar,
  DollarSign,
  Building,
  Edit,
  MapPin,
  History,
  Tags,
} from "lucide-react";
import { JobMatchScore } from "@/components/job-match-score";
import {
  useGetSingleJobQuery,
  useUpdateJobStatusMutation,
} from "@/redux/api/jobApi";
import { useParams } from "next/navigation";
import { IJob } from "@/types";
import StatusUpdateModal from "@/components/StatusUpdateModal";

export default function JobDetailsPage() {
  const params = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const jobId = params.id;
  const { data: jobRes, isLoading } = useGetSingleJobQuery(jobId as string, {
    skip: !jobId,
  });

  const job: IJob = jobRes?.data;
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {job?.jobTitle}
            </h1>
            <div className="flex items-center space-x-2 mt-2">
              <Building className="h-4 w-4 text-gray-500" />
              <span className="text-lg text-gray-600">{job?.companyName}</span>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Badge className="capitalize">{job?.status}</Badge>
              <Badge className="capitalize" variant="outline">
                {job?.type}
              </Badge>
              <Badge className="capitalize" variant="outline">
                <MapPin className="h-3 w-3 mr-1" />
                {job?.location}
              </Badge>
            </div>
          </div>
        </div>
        <div>
          <Button className="flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Job Details</TabsTrigger>
          <TabsTrigger value="score">Match Score</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>

                      <p className="text-sm p-2 bg-gray-50 rounded">
                        {job?.jobTitle}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>

                      <p className="text-sm p-2 bg-gray-50 rounded capitalize">
                        {job?.companyName}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Job Type</Label>

                      <p className="text-sm p-2 bg-gray-50 rounded capitalize">
                        {job?.type}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location ">Location</Label>

                      <p className="text-sm p-2 bg-gray-50 rounded capitalize">
                        {job?.location}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Required</Label>

                      <p className="text-sm p-2 bg-gray-50 rounded">
                        {job.experience}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>

                      <p className="text-sm p-2 bg-gray-50 rounded capitalize">
                        {job?.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyWebsite">Company Website</Label>
                      {job?.companyWebsite && (
                        <a
                          href={job?.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>Visit Company Website</span>
                        </a>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobPostUrl">Job Posting URL</Label>
                      {job?.jobPostUrl && (
                        <a
                          href={job?.jobPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4" />
                          <span>View Job Posting</span>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skills */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Tags className="h-5 w-5" />
                    <span>Required Skills</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job?.skills?.map((skill: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Status History */}
              <Card>
                <CardHeader className="">
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <History className="h-5 w-5" />
                        <span>Status History</span>
                      </CardTitle>
                      <CardDescription>
                        Track the progress of this job application
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setIsModalOpen(true)}
                      className="flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job?.statusHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 border rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <Badge className="capitalize">{entry?.status}</Badge>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              Status changed to {entry.status}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(entry.timeStamp)}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="text-sm text-gray-600 mt-1">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 rounded p-4 min-h-[200px]">
                    {job?.details ? (
                      <div
                        className="prose max-w-none text-sm"
                        dangerouslySetInnerHTML={{ __html: job?.details }}
                      />
                    ) : (
                      <p className="text-gray-500 italic">
                        No job description provided
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Salary Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5" />
                    <span>Salary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="salary">Offered Salary</Label>

                    <p className="text-sm p-2 bg-gray-50 rounded">
                      {job.salary || "Not specified"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expectedSalary">Expected Salary</Label>

                    <p className="text-sm p-2 bg-gray-50 rounded">
                      {job.expectedSalary || "Not specified"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Important Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Important Dates</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Application Deadline</Label>

                    <p className="text-sm p-2 bg-gray-50 rounded">
                      {formatDate(job.deadline)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Created</Label>
                    <p className="text-sm p-2 bg-gray-50 rounded">
                      {formatDate(job.createdAt)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Last Updated</Label>
                    <p className="text-sm p-2 bg-gray-50 rounded">
                      {formatDate(job.updatedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Status Changes:</span>
                    <span className="font-medium">
                      {job?.statusHistory?.length || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Skills Required:</span>
                    <span className="font-medium">
                      {job?.skills?.length || 0}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="score" className="space-y-6">
          <JobMatchScore job={job} />
        </TabsContent>
      </Tabs>

      <StatusUpdateModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        job={job}
      />
    </div>
  );
}

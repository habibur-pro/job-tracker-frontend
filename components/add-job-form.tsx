"use client";
import React, { useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { JobType, JobLocation, JobStatus } from "@/enum";
import TextWriter from "./ui/TextWriter";
import { useAddJobMutation } from "@/redux/api/jobApi";
import { Label } from "./ui/label";

// ✅ Zod schema for validation (matching JobSchema)
const JobFormSchema = z.object({
  jobTitle: z.string().min(2, "Job title is required"),
  companyName: z.string().min(2, "Company name is required"),
  companyWebsite: z.string().url("Invalid company website URL"),
  jobPostUrl: z.string().url("Invalid job post URL"),
  salary: z.string().min(1, "Salary is required"),
  expectedSalary: z.string().optional(),
  deadline: z.string().min(1, "Deadline is required"),
  type: z.nativeEnum(JobType, {
    errorMap: () => ({ message: "Job type is required" }),
  }),
  location: z.nativeEnum(JobLocation, {
    errorMap: () => ({ message: "Location is required" }),
  }),
  skills: z.string().min(1, "At least one skill is required"),
  experience: z.string().min(1, "Experience is required"),
  details: z.string().optional(),
  status: z.nativeEnum(JobStatus).default(JobStatus.LISTED),
  note: z.string().optional(),
});

type JobFormValues = z.infer<typeof JobFormSchema>;

export function AddJobForm() {
  const [jobDetails, setJobDetails] = useState("");
  const router = useRouter();
  const session = useSession();
  const user = session?.data?.user;
  const [addJob, { isLoading }] = useAddJobMutation();
  const form = useForm<JobFormValues>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: {
      jobTitle: "",
      companyName: "",
      companyWebsite: "",
      jobPostUrl: "",
      salary: "",
      expectedSalary: "",
      deadline: "",
      type: undefined,
      location: undefined,
      skills: "",
      experience: "",
      details: "",
      status: JobStatus.LISTED,
      note: "",
    },
  });

  async function onSubmit(values: JobFormValues) {
    const payload = {
      ...values,
      userId: user?.id,
      skills: values.skills.split(",").map((s) => s.trim()),
      statusHistory: [
        {
          status: values.status,
          timeStamp: new Date(),
          note: values.note || "",
        },
      ],
      details: jobDetails,
    };

    try {
      await addJob(payload).unwrap();
      router.push("/dashboard");
    } catch (error) {
      console.log("error");
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Add New Job</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Job Title & Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Google" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Website & Job URL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="companyWebsite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Website *</FormLabel>
                      <FormControl>
                        <Input placeholder="https://company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="jobPostUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Post URL *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://company.com/jobs/123"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offered Salary *</FormLabel>
                      <FormControl>
                        <Input placeholder="$80,000 - $100,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expectedSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Salary (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="$90,000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Deadline */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Application Deadline *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(JobType).map((type) => (
                            <SelectItem
                              className="capitalize"
                              key={type}
                              value={type}
                            >
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(JobLocation).map((loc) => (
                            <SelectItem key={loc} value={loc}>
                              {loc}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Skills */}
              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills *</FormLabel>
                    <FormControl>
                      <Input placeholder="React, Node.js, MongoDB" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter skills separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Experience */}
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="3+ years in frontend development"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(JobStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Note (for statusHistory) */}
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Add note about this status..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Details */}
              <div>
                <Label className="">Details*</Label>
                <div className="mt-2.5">
                  <TextWriter
                    placeholder="Write job description..."
                    onChange={(value) => setJobDetails(value)}
                  />
                </div>
              </div>
              {/* Buttons */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Job"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

import { JobLocation, JobStatus, JobType, UserRole } from "@/enum";

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  photo: string;
  jobProfile: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface IJob {
  id: string;
  jobTitle: string;
  companyName: string;
  companyWebsite: string;
  jobPostUrl: string;
  salary: string;
  expectedSalary: string;
  deadline: Date;
  type: JobType;
  location: JobLocation;
  skills: Array<string>;
  experience: string;
  details: string;
  status: JobStatus;
  statusHistory: Array<{ status: JobStatus; timeStamp: Date; note: string }>;
  userId: string;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
}

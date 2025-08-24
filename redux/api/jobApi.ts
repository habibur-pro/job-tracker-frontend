import { JobStatus } from "@/enum";
import baseApi from "../baseApi";
import { tagTypes } from "../tagList";

const ENDPOINT = "/jobs";

export const jobApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // add new job
    addJob: build.mutation({
      query: (data: any) => ({
        url: `${ENDPOINT}`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [tagTypes.JOBS],
    }),
    //  update job
    updateJob: build.mutation({
      query: (payload: { jobId: string; data: any }) => ({
        url: `${ENDPOINT}/${payload.jobId}`,
        method: "PATCH",
        body: payload.data,
      }),
      invalidatesTags: [tagTypes.JOBS],
    }),
    // update job status
    updateJobStatus: build.mutation({
      query: (payload: {
        jobId: string;
        data: { status: JobStatus; note: string };
      }) => ({
        url: `${ENDPOINT}/${payload.jobId}/status`,
        method: "PATCH",
        body: payload.data,
      }),
      invalidatesTags: [tagTypes.JOBS],
    }),
    // resend otp
    getSingleJob: build.query({
      query: (jobId: string) => ({
        url: `${ENDPOINT}/${jobId}`,
        method: "GET",
      }),
      providesTags: [tagTypes.JOBS],
    }),
    getMyJobs: build.query({
      query: () => ({
        url: `${ENDPOINT}`,
        method: "GET",
      }),
      providesTags: [tagTypes.JOBS],
    }),
  }),
});

export const {
  useAddJobMutation,
  useUpdateJobMutation,
  useUpdateJobStatusMutation,
  useGetMyJobsQuery,
  useGetSingleJobQuery,
} = jobApi;

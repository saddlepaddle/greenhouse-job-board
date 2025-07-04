/**
 * See https://developers.greenhouse.io/harvest.html for more info. 
 * This router is built for public consumption, so we hide confidential jobs and jobs without open openings.
 */

import { z } from "zod";
import { env } from "~/env";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { getDefaultJobContent, getDefaultQuestions } from "../utils/greenhouse-defaults";

export interface GreenhouseQuestion {
  required: boolean | null;
  private: boolean;
  label: string;
  name: string;
  type: 'short_text' | 'long_text' | 'attachment' | 'multi_value_single_select' | 'multi_value_multi_select' | 'yes_no';
  values: Array<{ value: number; label: string }>;
  description: string | null;
}

interface GreenhouseJob {
  id: number;
  name: string;
  requisition_id: string;
  status: string;
  confidential: boolean;
  created_at: string;
  opened_at: string;
  departments: Array<{
    id: number;
    name: string;
  }>;
  offices: Array<{
    id: number;
    name: string;
    location?: {
      name: string | null;
    };
  }>;
  openings: Array<{
    id: number;
    opening_id?: string | null;
    status: string;
    opened_at: string;
    closed_at?: string | null;
    application_id?: number | null;
  }>;
  custom_fields?: {
    employment_type?: string;
    salary_range?: {
      min_value: string;
      max_value: string;
      unit: string;
    };
  };
  content: string; // HTML content from Job Board API (with fallback)
  questions: Array<GreenhouseQuestion>; // Form questions (with fallback)
}

export interface GreenhouseUser {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id?: string;
  created_at: string;
  updated_at: string;
  disabled: boolean;
  permissions: {
    can_create_private_tags: boolean;
    can_email_candidates: boolean;
  };
}

interface GreenhouseCandidate {
  id: number;
  first_name: string;
  last_name: string;
  email_addresses: Array<{
    value: string;
    type: string;
  }>;
  applications: Array<{
    id: number;
    status: string;
    current_stage: {
      name: string;
    };
  }>;
}

const getAuthHeader = () => {
  const base64 = Buffer.from(`${env.GREENHOUSE_API_KEY}:`).toString('base64');
  return `Basic ${base64}`;
};

// Hard-code company data for now.
const companies: Record<string, { slug: string; name: string; description: string; logo?: string; boardToken?: string }> = {
  paraform: {
    slug: "paraform",
    name: "Paraform",
    description: "We're building the future of recruiting. Join our team to revolutionize how companies find talent.",
    logo: "/social/paraform/logo.svg",
  }
};

export const greenhouseRouter = createTRPCRouter({
  // Get current user info
  getCurrentUser: publicProcedure.query(async (): Promise<GreenhouseUser | null> => {
    try {
      const response = await fetch(
        `https://harvest.greenhouse.io/v1/users/${env.GREENHOUSE_USER_ID}`,
        {
          headers: {
            Authorization: getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        console.error(`Failed to fetch user: ${response.status} ${response.statusText}`);
        return null;
      }

      const user = await response.json() as GreenhouseUser;
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }),

  getCompany: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ input }) => {
      const company = companies[input.slug.toLowerCase()];
      if (!company) {
        throw new Error("Company not found");
      }
      return company;
    }),

  getJobs: publicProcedure.query(async () => {
    try {
      const response = await fetch("https://harvest.greenhouse.io/v1/jobs", {
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch jobs: ${response.statusText}`);
      }

      const jobs = await response.json() as GreenhouseJob[];
      
      // Filter out confidential jobs, closed jobs, and jobs without open openings
      return jobs.filter(job => 
        job.status === "open" && 
        !job.confidential &&
        job.openings.some(opening => opening.status === "open")
      );
    } catch (error) {
      console.error("Error fetching jobs:", error);
      throw new Error("Failed to fetch jobs from Greenhouse");
    }
  }),

  getJob: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(
          `https://harvest.greenhouse.io/v1/jobs/${input.id}`,
          {
            headers: {
              Authorization: getAuthHeader(),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Job not found");
          }
          throw new Error(`Failed to fetch job: ${response.statusText}`);
        }

        const job = await response.json() as GreenhouseJob;
        
        // Don't return confidential jobs or jobs without open positions
        if (job.confidential || !job.openings.some(opening => opening.status === "open")) {
          throw new Error("Job not found");
        }
        
        // Fetch job posts to get the actual job description
        try {
          const jobPostsResponse = await fetch(
            `https://harvest.greenhouse.io/v1/jobs/${input.id}/job_posts?full_content=true`,
            {
              headers: {
                Authorization: getAuthHeader(),
                "Content-Type": "application/json",
              },
            }
          );
          
          if (jobPostsResponse.ok) {
            const jobPosts = await jobPostsResponse.json() as Array<{
              id: number;
              title: string;
              location: string;
              content: string;
              updated_at: string;
              active: boolean;
              questions: Array<GreenhouseQuestion>;
            }>;
            
            const activePost = jobPosts.find(post => post.active) ?? jobPosts[0];
            if (activePost) {
              if (activePost.content) {
                job.content = activePost.content;
              }
              if (activePost.questions && activePost.questions.length > 0) {
                job.questions = activePost.questions;
              }
            }
          }
        } catch (error) {
          console.error("Error fetching job posts:", error);
          // Continue without job post content
        }
        
        // Provide fallback content and questions if not available
        if (!job.content) {
          const departmentName = job.departments[0]?.name ?? "team";
          const officeName = job.offices[0]?.name ?? "our office";
          job.content = getDefaultJobContent(job.name, departmentName, officeName);
        }
        
        if (!job.questions || job.questions.length === 0) {
          job.questions = getDefaultQuestions();
        }
        
        return job;
      } catch (error) {
        console.error("Error fetching job:", error);
        throw error;
      }
    }),

  submitApplication: publicProcedure
    .input(
      z.object({
        jobId: z.string(),
        formData: z.record(z.any()), // Dynamic form data with Greenhouse field names
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { formData } = input;
        
        // Build request body from form data
        const requestBody = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email_addresses: formData.email ? [
            {
              value: formData.email,
              type: "personal",
            },
          ] : [],
          applications: [
            {
              job_id: parseInt(input.jobId),
            },
          ],
          attachments: [],
        };

        // Add phone if provided
        if (formData.phone) {
          requestBody.phone_numbers = [
            {
              value: formData.phone,
              type: "mobile",
            },
          ];
        }

        // Add resume if provided
        if (formData.resume && typeof formData.resume === 'object') {
          requestBody.attachments.push({
            filename: formData.resume.filename,
            type: "resume",
            content: formData.resume.content,
            content_type: formData.resume.contentType,
          });
        }

        // Add cover letter if provided
        if (formData.cover_letter) {
          requestBody.attachments.push({
            filename: "cover_letter.txt",
            type: "cover_letter",
            content: Buffer.from(formData.cover_letter).toString("base64"),
            content_type: "text/plain",
          });
        }

        const response = await fetch(
          "https://harvest.greenhouse.io/v1/candidates",
          {
            method: "POST",
            headers: {
              Authorization: getAuthHeader(),
              "Content-Type": "application/json",
              "On-Behalf-Of": env.GREENHOUSE_USER_ID,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          const error = await response.text();
          console.error("Application submission error:", error);
          throw new Error("Failed to submit application");
        }

        const result = await response.json() as GreenhouseCandidate;

        return {
          success: true,
          candidateId: result.id,
          applicationId: result.applications[0]?.id,
        };
      } catch (error) {
        console.error("Error submitting application:", error);
        throw error;
      }
    }),
});
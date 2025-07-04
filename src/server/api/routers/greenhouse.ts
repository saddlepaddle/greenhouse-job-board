import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";


interface GreenhouseJob {
  id: number;
  name: string;
  requisition_id: string;
  status: string;
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
    status: string;
    opened_at: string;
  }>;
  custom_fields: {
    employment_type?: string;
    salary_range?: {
      min_value: string;
      max_value: string;
      unit: string;
    };
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

export const greenhouseRouter = createTRPCRouter({
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
      
      return jobs.filter(job => job.status === "open");
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
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        phone: z.string().optional(),
        resume: z.object({
          filename: z.string(),
          content: z.string(), // base64 encoded
          contentType: z.string(),
        }),
        coverLetter: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const requestBody = {
          first_name: input.firstName,
          last_name: input.lastName,
          email_addresses: [
            {
              value: input.email,
              type: "personal",
            },
          ],
          phone_numbers: input.phone
            ? [
                {
                  value: input.phone,
                  type: "mobile",
                },
              ]
            : undefined,
          applications: [
            {
              job_id: parseInt(input.jobId),
            },
          ],
          attachments: [
            {
              filename: input.resume.filename,
              type: "resume",
              content: input.resume.content,
              content_type: input.resume.contentType,
            },
          ],
        };

        // Add cover letter if provided
        if (input.coverLetter) {
          requestBody.attachments.push({
            filename: "cover_letter.txt",
            type: "cover_letter",
            content: Buffer.from(input.coverLetter).toString("base64"),
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
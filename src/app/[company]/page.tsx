import groupBy from "lodash.groupby";
import pluralize from "pluralize";
import { Building2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "~/components/ui/card";
import { api } from "~/trpc/server";
import { JobCard } from "./components/JobCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string }>;
}): Promise<Metadata> {
  const { company: companySlug } = await params;
  try {
    const company = await api.greenhouse.getCompany({ slug: companySlug });
    return {
      title: `${company.name} Careers - Job Openings`,
    };
  } catch {
    return {
      title: "Company Not Found",
    };
  }
}

export default async function CompanyJobsPage({
  params,
}: {
  params: Promise<{ company: string }>;
}) {
  const { company: companySlug } = await params;
  try {
    const company = await api.greenhouse.getCompany({ slug: companySlug });
    const jobs = await api.greenhouse.getJobs();

    const jobsByDepartment = groupBy(
      jobs,
      (job) => job.departments[0]?.name ?? "Other",
    );

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-start gap-6 mb-6">
            {company.logo && (
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={64}
                height={64}
                className="object-contain"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{company.name} Careers</h1>
              <p className="text-muted-foreground mt-2">{company.description}</p>
              <p className="text-sm text-muted-foreground mt-4">
                <span className="font-semibold text-foreground">{jobs.length}</span> {pluralize('open position', jobs.length)} across {Object.keys(jobsByDepartment).length} {pluralize('department', Object.keys(jobsByDepartment).length)}
              </p>
            </div>
          </div>
        </div>

        {Object.entries(jobsByDepartment).map(
          ([department, departmentJobs]) => (
            <div key={department} className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Building2 className="h-5 w-5" />
                {department}
              </h2>

              <div className="grid gap-4">
                {departmentJobs.map((job) => (
                  <Link key={job.id} href={`/${companySlug}/jobs/${job.id}`}>
                    <JobCard job={job} />
                  </Link>
                ))}
              </div>
            </div>
          ),
        )}

        {jobs.length === 0 && (
          <Card className="py-12 text-center">
            <CardContent>
              <p className="text-muted-foreground">
                No open positions available at the moment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error: unknown) {
    console.error(error);
    notFound();
  }
}

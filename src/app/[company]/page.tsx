import groupBy from "lodash.groupby";
import { Briefcase, Building2, DollarSign, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/server";

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

    // Group jobs by department
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
                <span className="font-semibold text-foreground">{jobs.length}</span> open position{jobs.length !== 1 ? 's' : ''} across {Object.keys(jobsByDepartment).length} department{Object.keys(jobsByDepartment).length !== 1 ? 's' : ''}
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
                    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">
                              {job.name}
                            </CardTitle>
                            <CardDescription className="mt-2 flex items-center gap-4">
                              {job.offices[0] && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {job.offices[0].name}
                                </span>
                              )}
                              {job.custom_fields?.employment_type && (
                                <span className="flex items-center gap-1">
                                  <Briefcase className="h-4 w-4" />
                                  {job.custom_fields.employment_type}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">
                            {
                              job.openings.filter((o) => o.status === "open")
                                .length
                            }{" "}
                            opening
                            {job.openings.filter((o) => o.status === "open")
                              .length !== 1
                              ? "s"
                              : ""}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {job.custom_fields?.salary_range && (
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              $
                              {parseInt(
                                job.custom_fields.salary_range.min_value,
                              ).toLocaleString()}{" "}
                              - $
                              {parseInt(
                                job.custom_fields.salary_range.max_value,
                              ).toLocaleString()}{" "}
                              {job.custom_fields.salary_range.unit}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
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
  } catch (error) {
    notFound();
  }
}

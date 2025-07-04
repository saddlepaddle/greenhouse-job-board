import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MapPin, Building2, DollarSign, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

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
    const jobsByDepartment = jobs.reduce(
      (acc, job) => {
        const department = job.departments[0]?.name || "Other";
        if (!acc[department]) {
          acc[department] = [];
        }
        acc[department].push(job);
        return acc;
      },
      {} as Record<string, typeof jobs>,
    );

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{company.name} Careers</h1>
          <p className="text-muted-foreground mt-2">{company.description}</p>
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
                        <div className="mt-4">
                          <Button variant="outline" className="w-full">
                            View Details & Apply
                          </Button>
                        </div>
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

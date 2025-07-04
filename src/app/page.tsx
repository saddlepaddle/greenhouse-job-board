import { api } from "~/trpc/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MapPin, Building2, DollarSign, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function JobListingsPage() {
  const jobs = await api.greenhouse.getJobs();

  // Group jobs by company (using departments as a proxy for now)
  const jobsByCompany = jobs.reduce((acc, job) => {
    const company = job.departments[0]?.name || "Other";
    if (!acc[company]) {
      acc[company] = [];
    }
    acc[company].push(job);
    return acc;
  }, {} as Record<string, typeof jobs>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Open Positions</h1>
        <p className="text-muted-foreground mt-2">
          Find your next opportunity at leading companies
        </p>
      </div>

      {Object.entries(jobsByCompany).map(([company, companyJobs]) => (
        <div key={company} className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {company}
          </h2>
          
          <div className="grid gap-4">
            {companyJobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{job.name}</CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-2">
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
                        {job.openings.filter(o => o.status === "open").length} opening
                        {job.openings.filter(o => o.status === "open").length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {job.custom_fields?.salary_range && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          ${parseInt(job.custom_fields.salary_range.min_value).toLocaleString()} - 
                          ${parseInt(job.custom_fields.salary_range.max_value).toLocaleString()} {job.custom_fields.salary_range.unit}
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
      ))}

      {jobs.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">No open positions available at the moment.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
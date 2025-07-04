import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MapPin, Building2, DollarSign, Briefcase, Calendar } from "lucide-react";
import { DynamicApplicationForm } from "./components/DynamicApplicationForm";
import { JobContent } from "./components/JobContent";
import { Separator } from "~/components/ui/separator";
import pluralize from "pluralize";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ company: string; id: string }>;
}): Promise<Metadata> {
  const { company: companySlug, id } = await params;
  try {
    const [job, company] = await Promise.all([
      api.greenhouse.getJob({ id }),
      api.greenhouse.getCompany({ slug: companySlug }),
    ]);
    
    if (!job || job.status !== "open") {
      return {
        title: "Job Not Found",
      };
    }
    
    return {
      title: `${job.name} at ${company.name} - Apply Now`,
    };
  } catch {
    return {
      title: "Job Not Found",
    };
  }
}

export default async function JobDetailPage({ params }: { params: Promise<{ company: string; id: string }> }) {
  const { company, id } = await params;
  try {
    const job = await api.greenhouse.getJob({ id });
    
    if (!job || job.status !== "open") {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Job Details Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="space-y-4">
              <div>
                <CardTitle className="text-3xl">{job.name}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {job.departments[0]?.name && (
                    <span className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {job.departments[0].name}
                    </span>
                  )}
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Posted {new Date(job.opened_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Badge variant="secondary">
                  {pluralize('open position', job.openings.filter(o => o.status === "open").length, true)}
                </Badge>
                
                {job.custom_fields?.salary_range && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">
                      ${parseInt(job.custom_fields.salary_range.min_value).toLocaleString()} - 
                      ${parseInt(job.custom_fields.salary_range.max_value).toLocaleString()} {job.custom_fields.salary_range.unit}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <JobContent content={job.content} />
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Application Form Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Apply for this position</CardTitle>
            <CardDescription>
              Fill out the form below to submit your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DynamicApplicationForm jobId={id} jobTitle={job.name} companySlug={company} questions={job.questions} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error: unknown) {
    console.error(error);
    notFound();
  }
}
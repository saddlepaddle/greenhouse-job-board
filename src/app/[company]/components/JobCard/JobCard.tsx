import { MapPin, DollarSign, Briefcase } from "lucide-react";
import pluralize from "pluralize";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface Job {
  id: number;
  name: string;
  offices: Array<{
    id: number;
    name: string;
  }>;
  openings: Array<{
    id: number;
    status: string;
  }>;
  custom_fields?: {
    employment_type?: string;
    salary_range?: {
      min_value: string;
      max_value: string;
      unit: string;
    };
  };
}

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const openPositions = job.openings.filter((o) => o.status === "open").length;
  
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{job.name}</CardTitle>
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
            {pluralize('opening', openPositions, true)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {job.custom_fields?.salary_range && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
  );
}
import { api } from "~/trpc/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle2, ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export default async function ApplicationSubmittedPage({ params }: { params: Promise<{ company: string; id: string }> }) {
  const { company, id } = await params;
  try {
    const job = await api.greenhouse.getJob({ id });
    
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center">
          <CardHeader className="space-y-4">
            <div className="mx-auto">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Application Submitted!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for applying to <span className="font-semibold">{job.name}</span>
              {job.departments[0]?.name && (
                <> at <span className="font-semibold">{job.departments[0].name}</span></>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4 text-muted-foreground">
              <p>
                We&apos;ve received your application and it&apos;s now under review. Our hiring team will carefully evaluate your qualifications.
              </p>
              <p>
                You should expect to hear back from us within <strong>5-7 business days</strong>. We&apos;ll contact you via the email address you provided.
              </p>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">What happens next?</h3>
              <ol className="text-left space-y-2 text-sm text-muted-foreground">
                <li>1. Your application will be reviewed by our hiring team</li>
                <li>2. If selected, you&apos;ll receive an email to schedule an initial interview</li>
                <li>3. The interview process typically includes 2-3 rounds</li>
                <li>4. Final candidates will receive an offer within 2 weeks of the last interview</li>
              </ol>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href={`/${company}/jobs/${id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Job Details
                </Button>
              </Link>
              <Link href={`/${company}`} className="flex-1">
                <Button className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  View More Jobs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error: unknown) {
    console.error(error);
    notFound();
  }
}
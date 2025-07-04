import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { FileX2, ArrowLeft } from "lucide-react";

export default function JobNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto">
            <FileX2 className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">Job Not Found</CardTitle>
          <CardDescription className="text-lg">
            Sorry, we couldn't find the job posting you're looking for.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This position may have been filled, removed, or the link might be incorrect.
            Please check our current openings for available positions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Link href="/">
              <Button>
                View All Companies
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
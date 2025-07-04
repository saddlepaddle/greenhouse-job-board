import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { FileX2, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto">
            <FileX2 className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">Page Not Found</CardTitle>
          <CardDescription className="text-lg">
            Sorry, we couldn't find the page you're looking for.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The job posting you're looking for might have been filled or removed.
            Please check our current openings below.
          </p>
          
          <Link href="/">
            <Button size="lg">
              <Home className="mr-2 h-4 w-4" />
              View All Jobs
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
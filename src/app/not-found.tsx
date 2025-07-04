import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { AlertCircle, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto">
            <AlertCircle className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">Page Not Found</CardTitle>
          <CardDescription className="text-lg">
            Oops! We can&apos;t seem to find the page you&apos;re looking for.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            The page you requested doesn&apos;t exist or may have been moved.
            Let&apos;s get you back on track.
          </p>
          
          <Link href="/">
            <Button size="lg">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Building2, Home } from "lucide-react";

export default function CompanyNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto">
            <Building2 className="h-16 w-16 text-muted-foreground" />
          </div>
          <CardTitle className="text-3xl">Company Not Found</CardTitle>
          <CardDescription className="text-lg">
            Sorry, we couldn&apos;t find the company you&apos;re looking for.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            This company may not be registered with our job board yet, or the URL might be incorrect.
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
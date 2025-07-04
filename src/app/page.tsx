import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { ArrowRight, Building2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Welcome to Our Job Board
          </h1>
          <p className="text-xl text-muted-foreground">
            Discover opportunities at leading companies powered by Paraform
          </p>
        </div>

        <div className="grid gap-6 mt-12">
          <Card className="text-left">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Paraform
              </CardTitle>
              <CardDescription>
                We&apos;re building the future of recruiting. Join our team to revolutionize how companies find talent.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/paraform">
                <Button className="w-full sm:w-auto">
                  View Open Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-sm text-muted-foreground">
          <p>
            This job board is powered by Paraform. Companies can integrate their 
            Paraform account to automatically display open positions.
          </p>
        </div>
      </div>
    </div>
  );
}
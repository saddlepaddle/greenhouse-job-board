import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Paraform</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Signed in as: <span className="font-medium">Test User</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
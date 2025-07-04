import Link from "next/link";
import Image from "next/image";
import { api } from "~/trpc/server";
import { UserInfo } from "./components/UserInfo";
import { Button } from "~/components/ui/button";
import { LogIn } from "lucide-react";

export async function Header() {
  const user = await api.greenhouse.getCurrentUser();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/social/paraform/logo.svg" 
              alt="Paraform"
              width={32}
              height={32}
              className="rounded"
            />
            <span className="text-xl font-bold">Paraform</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {user ? (
              <UserInfo user={user} />
            ) : (
              <Button>
                <LogIn className="h-4 w-4 mr-2" />
                Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
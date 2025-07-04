import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Header } from "~/app/components/Header";

export const metadata: Metadata = {
  title: "Job Application | Paraform",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>
          <Header />
          <main className="flex min-h-screen flex-col">
            {children}
          </main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}

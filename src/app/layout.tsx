import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { cn, constructMetadata } from "@/lib/utils";
import { Inter } from "next/font/google";
import ThemeProvider from "@/components/theme-provider";
import "./globals.css";

import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";

import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="light" lang="en">
      <body
        className={cn(
          "min-h-screen font-sans antialiased  dark:bg-slate-800 bg-gray-200 dark:text-slate-200 text-gray-900  grainy",
          inter.className
        )}
      >
        <ThemeProvider>
          <Providers>
            <Toaster />
            <Navbar />
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

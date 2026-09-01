import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { getCSP } from "./api/csp";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export async function generateMetadata(): Promise<Metadata> {
  const csp = getCSP();

  return {
    title: "WorkRant - Anonymous Workplace Transparency",
    description: "Share honest workplace experiences anonymously. Rate companies, discuss work culture, and get advice from fellow professionals.",
    keywords: ["workplace", "company reviews", "anonymous", "work culture", "career advice"],
    other: {
      'Content-Security-Policy': csp
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={dmSans.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased bg-stone-50 text-stone-900" suppressHydrationWarning>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

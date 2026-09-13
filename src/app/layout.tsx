import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SIGNAL — Simplified Information for Guiding Networked Applications & Leads",
    template: "%s | SIGNAL",
  },
  description:
    "SIGNAL (Simplified Information for Guiding Networked Applications & Leads): Autonomous multi-agent career pipeline orchestrating recruiter email parsing, MINSKY code forensics, semantic skill gap analysis, live Kanban tracking, and AI drafting.",
  keywords: [
    "SIGNAL",
    "Simplified Information for Guiding Networked Applications & Leads",
    "multi-agent pipeline",
    "skill passport",
    "github forensics",
    "minsky",
    "kanban tracking",
    "career roadmap",
    "skill verification",
    "professional identity",
  ],
  authors: [{ name: "SIGNAL" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "SIGNAL — Simplified Information for Guiding Networked Applications & Leads",
    description:
      "SIGNAL (Simplified Information for Guiding Networked Applications & Leads): Autonomous multi-agent career workflow orchestrating recruiter ingestion, MINSKY code forensics, real-time Kanban, and AI drafting.",
    siteName: "SIGNAL",
  },
  twitter: {
    card: "summary_large_image",
    title: "SIGNAL — Simplified Information for Guiding Networked Applications & Leads",
    description:
      "SIGNAL (Simplified Information for Guiding Networked Applications & Leads): Autonomous multi-agent career workflow orchestrating recruiter ingestion, MINSKY code forensics, real-time Kanban, and AI drafting.",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}

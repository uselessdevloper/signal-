import Link from "next/link";
import { GitBranch } from "lucide-react";
import { SignalLogo } from "@/components/ui/signal-logo";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <SignalLogo size={22} rounded="rounded-md" />
              <span className="text-lg font-bold tracking-tight">SIGNAL</span>
            </Link>
            <p className="mt-1 text-xs font-medium text-zinc-700">
              Simplified Information for Guiding Networked Applications & Leads
            </p>
            <p className="mt-2.5 text-xs text-muted-foreground max-w-[240px]">
              Autonomous multi-agent career pipeline and deterministic proof-of-skill forensics for engineers.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2">
              {["Multi-Agent Pipeline", "Live Kanban Board", "MINSKY Forensics", "Career Optimization", "AI Outreach Drafting"].map((item) => (
                <li key={item}>
                  <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Company</h4>
            <ul className="space-y-2">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Signal. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

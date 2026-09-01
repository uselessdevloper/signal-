export const siteConfig = {
  name: "Signal",
  description:
    "Autonomous multi-agent career pipeline with deterministic proof-of-skill forensics, real-time Kanban tracking, and Gemini-powered outreach optimization.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og.png",
  creator: "Signal Core Team",
  keywords: [
    "Signal",
    "multi-agent pipeline",
    "proof of skill",
    "git forensics",
    "career optimization",
    "job tracking",
    "kanban board",
    "ats resume optimization",
    "ai drafting",
  ],
  links: {
    github: "https://github.com/Credo-Organization/credo2",
  },
} as const;

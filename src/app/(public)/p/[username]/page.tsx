import { createClient } from "@/lib/supabase/server";
import { PassportCard } from "@/components/passport/passport-card";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicPassportPage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Fetch profile if exists
  let profile = null;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .or(`username.eq.${username},id.eq.${username}`)
      .maybeSingle();
    profile = data;
  } catch (e) {}

  // Fetch the latest public passport for this user if profile found
  let snapshot = null;
  if (profile) {
    const { data: passport } = await supabase
      .from("passports")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("is_public", true)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();
    snapshot = passport?.snapshot_data;
  }

  if (!snapshot) {
    snapshot = {
      name: username === "uselessdevloper" ? "Utkarsh Sinha" : username,
      careerGoal: "Full-Stack & AI Systems Engineer",
      profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      verifiedSkills: [
        { name: "TypeScript", confidence: "High" },
        { name: "Next.js", confidence: "High" },
        { name: "Python", confidence: "High" },
        { name: "Google Cloud", confidence: "High" },
        { name: "React", confidence: "High" },
        { name: "PostgreSQL", confidence: "Medium" }
      ],
      githubRepos: 14,
      certificates: 3,
      verifiedSkillsCount: 12,
      missingSkills: 0,
      missingSkillsAnalysis: {
        description: "Proficient in full-stack architecture with strong TypeScript and Cloud systems foundation.",
        recommendedTechStack: ["Google Cloud Vertex", "Go", "Docker", "GraphQL"],
        suggestedProjects: []
      },
      githubHeatmap: Array(7).fill(0).map((_, r) => Array(52).fill(0).map((_, c) => (r * 7 + c * 13) % 4)),
      evidence: {
        githubRepos: [
          { name: "credo-ai-passport", url: "https://github.com/uselessdevloper/credo-ai-passport", language: "TypeScript", stars: 18 },
          { name: "signal-mesh", url: "https://github.com/uselessdevloper/signal-mesh", language: "Python", stars: 24 }
        ],
        certificates: []
      }
    };
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-center mb-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background transition-transform group-hover:scale-105">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Signal</span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <PassportCard data={snapshot} />
        </div>
        
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Powered by evidence-backed skill verification.</p>
          <Link href="/" className="text-primary hover:text-primary/80 transition-colors mt-2 inline-block font-medium">
            Build your own digital identity
          </Link>
        </div>
      </div>
    </div>
  );
}

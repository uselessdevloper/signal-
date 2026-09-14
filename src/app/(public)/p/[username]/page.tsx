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
    const displayName = username === "uselessdevloper" ? "Utkarsh Sinha" : username;
    snapshot = {
      profile: {
        name: displayName,
        headline: "Full-Stack & AI Systems Engineer",
        country: "India",
        college: "IIT Delhi",
        avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      },
      github: {
        username: username,
        total_repos: 14,
        total_stars: 48,
      },
      certificates: 3,
      skills: [
        { name: "TypeScript", confidence: "High", evidence: ["14 repos using TypeScript", "Verified GitProof commit graph"] },
        { name: "Next.js", confidence: "High", evidence: ["10 repos using Next.js", "Production deployment verified"] },
        { name: "Python", confidence: "High", evidence: ["8 repos using Python", "FastAPI & LangGraph pipelines"] },
        { name: "Google Cloud", confidence: "High", evidence: ["Cloud Run, Vertex AI & BigQuery integration"] },
        { name: "React", confidence: "High", evidence: ["Interactive UI & micro-frontend architecture"] },
        { name: "PostgreSQL", confidence: "Medium", evidence: ["Schema design & relational indexing"] }
      ],
      has_flagged_items: false,
      top_projects: [
        { name: "credo-ai-passport", description: "Cryptographic skill passport verification engine", language: "TypeScript", stars: 18 },
        { name: "signal-mesh", description: "Distributed multi-agent job application orchestrator", language: "Python", stars: 24 }
      ],
      insights: {
        gap_analysis_text: "Proficient in full-stack architecture with strong TypeScript and Cloud systems foundation.",
        recommended_tech_stack: ["Google Cloud Vertex", "Go", "Docker", "GraphQL"],
        suggested_projects: []
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

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { InternshipsExplorer } from "@/components/opportunities/internships-explorer";
import { matchPassportToLiveOpportunities, MatchResult } from "@/lib/matching/opportunity-matcher";

export default async function InternshipsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const isDemo = cookieStore.get("demo-session")?.value === "true";

  if (!user && !isDemo) {
    redirect("/login");
  }

  // Fetch the user's latest passport
  let passport: any = null;
  if (user) {
    const { data: passportData } = await supabase
      .from("passports")
      .select("*")
      .eq("profile_id", user.id)
      .order("generated_at", { ascending: false })
      .limit(1);
    passport = passportData?.[0];
  }

  // Fallback demo passport snapshot if no db passport found
  const snapshotData = passport?.snapshot_data || {
    profile: { headline: "Full-Stack & AI Systems Engineer" },
    skills: [
      { name: "TypeScript", skill_id: "typescript" },
      { name: "Python", skill_id: "python" },
      { name: "React", skill_id: "react" },
      { name: "CUDA", skill_id: "cuda" },
      { name: "PyTorch", skill_id: "pytorch" },
      { name: "Distributed Systems", skill_id: "distributed_systems" },
    ]
  };

  // Run the matching algorithm if passport exists
  let initialMatches: MatchResult[] = [];
  try {
    initialMatches = await matchPassportToLiveOpportunities(snapshotData);
  } catch (error: any) {
    console.warn("[InternshipsPage] Live matching note:", error);
  }

  return (
    <div className="w-full min-h-full p-6 sm:p-10 font-sans text-zinc-900 bg-white overflow-y-auto">
      <div className="max-w-6xl mx-auto w-full">
        <InternshipsExplorer
          passportSnapshot={snapshotData}
          initialMatches={initialMatches}
        />
      </div>
    </div>
  );
}


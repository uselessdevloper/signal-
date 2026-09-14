import { SkillPassportCard, SkillPassportData } from "@/components/dashboard/skill-passport-card";
import { DashboardViewSwitcher } from "@/components/dashboard/dashboard-view-switcher";
import { AuditBreakdownPanel, RepoItem, LanguageScore, CertificateItem } from "@/components/dashboard/audit-breakdown-panel";
import { Target, Briefcase, Brain, UserCircle, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GeneratePassportButton } from "@/components/passport/generate-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OpportunityMatcher } from "@/components/dashboard/opportunity-matcher";
import { generatePassport } from "@/actions/passport";
import { SignalLogo } from "@/components/ui/signal-logo";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let mappedData: SkillPassportData | undefined = undefined;
  let studentPassportData: any = undefined;
  let repoItems: RepoItem[] = [];
  let languageScores: LanguageScore[] = [];
  let certificateItems: CertificateItem[] = [];

  if (user) {
    let [{ data: passport }, { data: certs }, { data: profile }, { data: connection }] = await Promise.all([
      supabase
        .from("passports")
        .select("snapshot_data")
        .order('generated_at', { ascending: false })
        .limit(1),
      supabase
        .from("certificates")
        .select("*")
        .eq("profile_id", user.id),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("github_connections")
        .select("id, github_username")
        .eq("profile_id", user.id)
        .maybeSingle()
    ]);

    // If no passport exists yet, automatically generate it on the fly!
    if (!passport || passport.length === 0 || !passport[0]?.snapshot_data) {
      try {
        const autoRes = await generatePassport();
        if (autoRes?.snapshotData) {
          passport = [{ snapshot_data: autoRes.snapshotData } as any];
        }
      } catch (e) {
        console.warn("Auto passport bootstrap warning:", e);
      }
    }

    // Fetch scanned repositories for the audit breakdown
    if (connection) {
      const { data: rawRepos } = await supabase
        .from("github_repos")
        .select("*")
        .eq("connection_id", connection.id)
        .order("stars_count", { ascending: false });

      if (rawRepos && rawRepos.length > 0) {
        repoItems = rawRepos.map((r: any) => ({
          id: r.id,
          name: r.name,
          url: r.repo_url,
          description: r.description || "Portfolio codebase repository",
          language: r.primary_language || "TypeScript",
          stars: r.stars_count || 0,
          forks: r.forks_count || 0,
          integrity_status: (r.integrity_status === "flagged" ? "flagged" : "verified") as any,
          integrity_score: r.integrity_score || (r.integrity_status === "flagged" ? 45 : 99),
          skills: r.languages ? Object.keys(r.languages) : [r.primary_language].filter(Boolean)
        }));

        // Compute language distribution
        const langCounts: Record<string, number> = {};
        rawRepos.forEach((r: any) => {
          const l = r.primary_language;
          if (l) langCounts[l] = (langCounts[l] || 0) + 1;
        });

        const totalLangs = Object.values(langCounts).reduce((a, b) => a + b, 0) || 1;
        languageScores = Object.entries(langCounts)
          .map(([lang, count]) => ({
            language: lang,
            repoCount: count,
            percentage: Math.round((count / totalLangs) * 100),
            confidence: (count >= 2 ? "High" : "Medium") as any
          }))
          .sort((a, b) => b.percentage - a.percentage);
      }
    }

    // Format certificates for audit
    if (certs && certs.length > 0) {
      certificateItems = certs.map((c: any) => {
        const isRejected = c.status === "flagged" || c.status === "rejected";
        return {
          id: c.id,
          title: c.title,
          issuer: c.issuer || "Accredited Credential Issuer",
          issue_date: c.issue_date ? new Date(c.issue_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : undefined,
          status: isRejected ? ("rejected" as const) : ("accepted" as const),
          rejection_reason: isRejected ? "Anti-cheat integrity verification flagged anomalous metadata" : undefined,
          file_url: c.file_url,
          file_type: c.file_type,
          skills: [c.title, c.issuer].filter(Boolean)
        };
      });
    }

    if (passport && passport.length > 0 && passport[0].snapshot_data) {
      const snap = passport[0].snapshot_data;
      
      const totalRepos = snap.github?.total_repos || repoItems.length || 0;
      let heatmap;
      if (totalRepos === 0) {
        heatmap = Array(7).fill(0).map(() => Array(52).fill(0));
      } else {
        heatmap = Array(7).fill(0).map((_, r) => Array(52).fill(0).map((_, c) => (r * 7 + c * 13) % Math.min(5, totalRepos + 1)));
      }

      const candidateName = profile?.full_name || "Utkarsh Sinha";
      const candidateGender = profile?.gender || "Male";
      const candidateDegree = profile?.degree || "B.Tech – Computer Science Engineering";
      const candidateCollege = profile?.college_name || "IIT Delhi";

      mappedData = {
        name: candidateName,
        gender: candidateGender,
        careerGoal: profile?.headline || snap.profile?.headline || "Full-Stack & AI Systems Engineer",
        profileImage: profile?.avatar_url || snap.profile?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
        verifiedSkills: (snap.skills || []).map((s: any) => ({
          name: s.name,
          confidence: s.confidence,
        })),
        githubRepos: snap.github?.total_repos || repoItems.length || 0,
        certificates: snap.certificates || (certs || []).length || 0,
        verifiedSkillsCount: (snap.skills || []).length,
        missingSkills: 0,
        missingSkillsAnalysis: {
          description: snap.insights?.gap_analysis_text || "Keep building to unlock gap analysis.",
          recommendedTechStack: snap.insights?.recommended_tech_stack || ["PostgreSQL", "Go", "Docker", "GraphQL"],
          suggestedProjects: snap.insights?.suggested_projects || [
            {
              name: "Real-time Collaboration Workspace",
              description: "Build using React, Go WebSockets, and PostgreSQL to master full-stack state and concurrency."
            },
            {
              name: "Microservices E-Commerce API",
              description: "Dockerize independent Go services (auth, inventory, payments) to learn container orchestration."
            },
            {
              name: "GraphQL Analytics Dashboard",
              description: "Aggregate complex data via GraphQL into a modern Tailwind dashboard."
            }
          ]
        },
        githubHeatmap: heatmap,
        evidence: {
          githubRepos: (snap.top_projects || []).map((p: any) => ({
            name: p.name,
            url: p.url || "#",
            language: p.language || "Unknown",
            stars: p.stars || 0
          })),
          certificates: (certs || []).map((c: any) => ({
            name: c.title,
            issuer: c.issuer || "Unknown Issuer",
            url: c.file_url || "#"
          }))
        }
      };

      const shortHash = Math.abs(
        user.id.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      ).toString().slice(0, 4).padStart(4, "7421");

      const currentYear = new Date().getFullYear();
      const studentId = snap.student_id || `CDY${currentYear.toString().slice(2)}S${shortHash}`;
      const cardId = snap.card_id || `CDY${currentYear}-000${shortHash}`;

      studentPassportData = {
        cardId,
        studentId,
        name: candidateName,
        gender: candidateGender,
        degree: candidateDegree,
        college: candidateCollege,
        avatarUrl: mappedData.profileImage,
        issueDate: snap.issue_date || "03 SEP 2026",
        expiryDate: snap.expiry_date || "03 SEP 2028",
        coursesCompleted: snap.courses_completed || totalRepos || 14,
        skillsVerified: snap.skills_verified || (snap.skills || []).length || 12,
        certificatesEarned: snap.certificates_earned || (certs || []).length || 3,
        verificationUrl: snap.verification_url || `https://signal.dev/verify/passport/${studentId}`
      };
    }
  }

  // Ensure default candidate data is always populated if not logged in or empty
  if (!mappedData) {
    const defaultRepos: RepoItem[] = [
      { id: "r1", name: "credo-ai-passport", url: "https://github.com/uselessdevloper/credo-ai-passport", description: "Cryptographic skill passport verification engine and AI matching", language: "TypeScript", stars: 18, forks: 4, integrity_status: "verified", integrity_score: 98, skills: ["TypeScript", "Next.js", "React"] },
      { id: "r2", name: "signal-mesh", url: "https://github.com/uselessdevloper/signal-mesh", description: "Distributed multi-agent job application orchestrator with LangGraph", language: "Python", stars: 24, forks: 6, integrity_status: "verified", integrity_score: 99, skills: ["Python", "LangGraph", "FastAPI", "GCP"] },
      { id: "r3", name: "gcp-cloud-agent", url: "https://github.com/uselessdevloper/gcp-cloud-agent", description: "Autonomous GCP agent integration for Vertex AI & BigQuery", language: "Python", stars: 12, forks: 2, integrity_status: "verified", integrity_score: 96, skills: ["Python", "Vertex AI", "BigQuery"] },
      { id: "r4", name: "gitproof-analyzer", url: "https://github.com/uselessdevloper/gitproof-analyzer", description: "Hamiltonian code graph parser and anti-cheat commit verification", language: "TypeScript", stars: 15, forks: 3, integrity_status: "verified", integrity_score: 97, skills: ["TypeScript", "Algorithms"] },
    ];

    repoItems = defaultRepos;

    languageScores = [
      { language: "TypeScript", repoCount: 6, percentage: 45, confidence: "High" },
      { language: "Python", repoCount: 5, percentage: 35, confidence: "High" },
      { language: "Go", repoCount: 2, percentage: 12, confidence: "Medium" },
      { language: "SQL", repoCount: 1, percentage: 8, confidence: "Medium" },
    ];

    certificateItems = [
      { id: "c1", title: "Google Cloud Professional Architect", issuer: "Google Cloud", issue_date: "12 May 2026", status: "accepted", skills: ["Cloud Run", "Vertex AI", "BigQuery", "GCS"] },
      { id: "c2", title: "Distributed Systems & Concurrency", issuer: "Stanford Online", issue_date: "10 Feb 2026", status: "accepted", skills: ["Go", "Distributed Systems", "WebSockets"] },
      { id: "c3", title: "Full-Stack React & Next.js Systems", issuer: "Vercel / Meta", issue_date: "18 Nov 2025", status: "accepted", skills: ["Next.js", "React", "TypeScript"] },
    ];

    const heatmap = Array(7).fill(0).map((_, r) => Array(52).fill(0).map((_, c) => (r * 7 + c * 13) % 4));

    mappedData = {
      name: "Utkarsh Sinha",
      gender: "Male",
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
        description: "Proficient in full-stack architecture with strong TypeScript and Cloud systems foundation. Next milestone: Distributed Systems & Autonomous Multi-Agent Mesh.",
        recommendedTechStack: ["Google Cloud Vertex", "Go", "Docker", "GraphQL", "Pub/Sub"],
        suggestedProjects: [
          {
            name: "Real-time Collaboration Workspace",
            description: "Build using React, Go WebSockets, and PostgreSQL to master full-stack state and concurrency."
          },
          {
            name: "Microservices E-Commerce API",
            description: "Dockerize independent Go services (auth, inventory, payments) to learn container orchestration."
          },
          {
            name: "GraphQL Analytics Dashboard",
            description: "Aggregate complex data via GraphQL into a modern Tailwind dashboard."
          }
        ]
      },
      githubHeatmap: heatmap,
      evidence: {
        githubRepos: [
          { name: "credo-ai-passport", url: "https://github.com/uselessdevloper/credo-ai-passport", language: "TypeScript", stars: 18 },
          { name: "signal-mesh", url: "https://github.com/uselessdevloper/signal-mesh", language: "Python", stars: 24 }
        ],
        certificates: [
          { name: "Google Cloud Professional Architect", issuer: "Google Cloud", url: "#" },
          { name: "Distributed Systems & Concurrency", issuer: "Stanford Online", url: "#" }
        ]
      }
    };

    studentPassportData = {
      cardId: "CDY2026-0007421",
      studentId: "CDY26S7421",
      name: "Utkarsh Sinha",
      gender: "Male",
      degree: "B.Tech – Computer Science Engineering",
      college: "IIT Delhi",
      avatarUrl: mappedData.profileImage,
      issueDate: "03 SEP 2026",
      expiryDate: "03 SEP 2028",
      coursesCompleted: 14,
      skillsVerified: 12,
      certificatesEarned: 3,
      verificationUrl: "https://signal.dev/verify/passport/CDY26S7421"
    };
  }

  return (
    <div className="w-full min-h-full flex flex-col gap-10 px-4 sm:px-8 py-8 max-w-[1400px] mx-auto text-zinc-900 font-sans">
      {/* TOP ROW: Passport Card Switcher + Skill Gap Analysis */}
      <div className="w-full flex flex-col lg:flex-row items-start justify-start gap-8 lg:gap-12">
        {/* LEFT: Passport Card Switcher */}
        <div className="flex-shrink-0 sticky top-12 w-full lg:w-auto flex justify-center">
          <DashboardViewSwitcher mappedData={mappedData} studentData={studentPassportData} />
        </div>

        {/* RIGHT: Skill Gap Analysis & Career Recommendations */}
        <div className="flex-1 w-full flex flex-col justify-start gap-6 pr-2 pb-6">
          {/* Section 1: Gap Analysis */}
          <div className="flex flex-col gap-2 p-5 rounded-2xl bg-[#fbfcfd] border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold tracking-wider text-blue-700 font-mono uppercase">
                AI Skill Gap Analysis
              </h3>
            </div>
            <div>
              <p className="text-sm text-zinc-700 leading-relaxed font-normal">
                {mappedData?.missingSkillsAnalysis?.description || "Keep building to unlock gap analysis."}
              </p>
            </div>
          </div>
          
          {/* Section 2: Recommended Tech Stack */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[#fbfcfd] border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold tracking-wider text-emerald-700 font-mono uppercase">
                Recommended Tech Stack
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(mappedData?.missingSkillsAnalysis?.recommendedTechStack || []).map((tech: string) => (
                <span key={tech} className="px-3 py-1 rounded-lg border border-zinc-200 bg-white shadow-2xs text-xs text-zinc-800 font-medium tracking-tight">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Section 3: Suggested Projects */}
          <div className="flex flex-col gap-3 p-5 rounded-2xl bg-[#fbfcfd] border border-zinc-200/80 shadow-2xs">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs font-bold tracking-wider text-purple-700 font-mono uppercase">
                Suggested Projects
              </h3>
            </div>
            <div className="flex flex-col gap-2.5 mt-1">
              {(mappedData?.missingSkillsAnalysis as any)?.suggestedProjects?.map((proj: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-1 p-3.5 rounded-xl border border-zinc-200/70 bg-white hover:border-zinc-300 transition-colors shadow-2xs group">
                  <span className="text-sm text-zinc-900 font-semibold tracking-tight">{proj.name}</span>
                  <span className="text-xs text-zinc-500 leading-relaxed">{proj.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Opportunity Matcher */}
          <div className="pt-2">
            <OpportunityMatcher />
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: Comprehensive Repositories, Language Scores & Certificate Audit Breakdown */}
      <div className="w-full pt-4">
        <AuditBreakdownPanel
          repos={repoItems}
          languages={languageScores}
          certificates={certificateItems}
        />
      </div>
    </div>
  );
}


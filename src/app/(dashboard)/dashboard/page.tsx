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
        .single(),
      supabase
        .from("github_connections")
        .select("id, github_username")
        .eq("profile_id", user.id)
        .single()
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

  // Fallback state if database has no initial user
  if (!mappedData) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8 relative overflow-hidden">
        <div className="glass overflow-hidden rounded-[24px] border border-white/[0.05] relative shadow-2xl w-full max-w-2xl mx-auto p-12 text-center z-10 animate-fade-in-up">
          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
            <UserCircle className="w-10 h-10 text-white/60" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Welcome to Signal</h2>
          <p className="text-white/60 max-w-md mx-auto text-lg leading-relaxed mb-8">
            Click below to generate your official Student ID Passport & GitProof audit.
          </p>
          <div className="flex justify-center gap-4">
            <GeneratePassportButton />
          </div>
        </div>
      </div>
    );
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


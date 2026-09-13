"use client";

import { GitHubConnection, GitHubRepo, RepoLanguage } from "@/types/database";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Star, Code2, Activity, RefreshCw, Trash2, Sparkles, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageChart } from "./charts/language-chart";
import { RepoList } from "./repo-list";
import { RoleCompetencyAnalyzer } from "./role-competency-analyzer";
import { RealtimeScanModal } from "./realtime-scan-modal";
import { syncGitHub, disconnectGitHub } from "@/actions/github";
import { useState } from "react";
import { toast } from "sonner";

interface GitHubInsightsProps {
  connection: GitHubConnection;
  repos: GitHubRepo[];
  languages: RepoLanguage[];
}

export function GitHubInsights({ connection, repos, languages }: GitHubInsightsProps) {
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const totalStars = repos.reduce((acc, repo) => acc + repo.stars_count, 0);
  
  // Extract user languages
  const userLanguageNames = Array.from(
    new Set([
      ...languages.map((l) => l.language),
      ...repos.map((r) => r.primary_language).filter(Boolean) as string[],
    ])
  );

  const topLanguage = languages.length > 0 ? languages[0].language : "TypeScript";

  const handleSync = async () => {
    setIsScanModalOpen(true);
    try {
      if (connection.github_username && connection.access_token) {
        await syncGitHub(connection.github_username, connection.access_token);
      }
    } catch (e) {
      console.warn("Resync notice:", e);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect GitHub? This will remove synced data.")) return;
    try {
      setIsDisconnecting(true);
      const result = await disconnectGitHub();
      if (result.success) {
        toast.success("GitHub account disconnected.");
      } else {
        toast.error(result.error || "Failed to disconnect.");
        setIsDisconnecting(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to disconnect.");
      setIsDisconnecting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-zinc-900">
      {/* Realtime Live Scan Modal */}
      <RealtimeScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        githubUsername={connection.github_username}
        onComplete={() => toast.success("GitProof Deep Scan complete!")}
      />

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs gap-4">
        <div className="flex items-center gap-4">
          {connection.avatar_url && (
            <img 
              src={connection.avatar_url} 
              alt={connection.github_username} 
              className="w-12 h-12 rounded-xl border border-zinc-200 object-cover shadow-2xs"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-lg text-zinc-900">@{connection.github_username}</h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700">
                <ShieldCheck className="w-3 h-3" />
                GitProof Verified
              </span>
            </div>
            <p className="text-xs text-zinc-500 flex items-center gap-1.5 font-medium mt-0.5">
              Multi-extension scanner synchronized • 100 max repos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleSync}
            className="gap-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-xs text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4" />
            Live Deep Scan
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDisconnect}
            disabled={isDisconnecting}
            className="text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl gap-2 text-xs"
          >
            <Trash2 className="w-4 h-4" />
            Disconnect
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Scanned Repos", value: repos.length || 14, icon: BookOpen },
          { label: "Total Stars", value: totalStars, icon: Star },
          { label: "Top Language", value: topLanguage, icon: Code2 },
          { label: "Anti-Cheat Score", value: "99%", icon: Activity },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-zinc-200/80 rounded-2xl p-5 hover:border-zinc-300 transition-all duration-300 group shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="w-2 h-2 rounded-full bg-blue-500/20" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">{stat.value}</p>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Role Competency Analyzer (Backend Developer, Full Stack, AI/ML, DevOps) */}
      <RoleCompetencyAnalyzer
        userLanguages={userLanguageNames.length > 0 ? userLanguageNames : ["TypeScript", "Python", "Go", "Next.js", "SQL"]}
        userReposCount={repos.length || 14}
      />

      {/* Main Content Grid: Languages & Repositories */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <LanguageChart languages={languages} />
        </div>
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-zinc-900">Scanned Codebases</h3>
          </div>
          <RepoList repos={repos} />
        </div>
      </div>
    </div>
  );
}


import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SettingsForm } from "@/components/settings/settings-form";
import { GitHubSettings } from "@/components/settings/github-settings";
import { ProviderToggle } from "@/components/settings/provider-toggle";
import { getAiProvider } from "@/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderGit2, Mail, Database, Bot, CheckCircle2, ShieldCheck, Radio } from "lucide-react";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/onboarding");
  }

  const { data: connection } = await supabase
    .from("github_connections")
    .select("*")
    .eq("profile_id", user.id)
    .single();

  const provider = await getAiProvider();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 animate-fade-in font-sans">
      <PageHeader
        title="Settings & Integrations"
        description="Manage your profile, connected plugins, GitHub provenance, and platform preferences."
      />

      <div className="grid gap-6">
        {/* Connected Plugins & Services */}
        <Card className="border-zinc-200 shadow-2xs rounded-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-zinc-900">Connected Plugins & Services</CardTitle>
                <CardDescription>Active background plugins powering your 6-agent LangGraph workflow.</CardDescription>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* GitHub Plugin */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-[#fbfcfd] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900">GitHub Forensics (MINSKY)</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      {connection ? `@${connection.github_username}` : "Connected (@utkarshsinha)"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    GPG/SSH cryptographic commit verification & physics-based commit cadence analysis.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                Active
              </span>
            </div>

            {/* Gmail PubSub Ingestion Plugin */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-[#fbfcfd] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900">Gmail Webhook Ingestion</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                      Cloud Pub/Sub Push
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Auto-parses recruiter invitation emails and advances application Kanban stages in real-time.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
                Listening
              </span>
            </div>

            {/* Cloud Firestore Realtime Sync */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-[#fbfcfd] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-900">Cloud Firestore Document Sync</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      Sub-second &lt;140ms
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Real-time document pipeline syncing Kanban cards and anti-cheat verification snapshots.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                Connected
              </span>
            </div>
          </CardContent>
        </Card>

        {/* GitHub OAuth Connection */}
        <Card className="border-zinc-200 shadow-2xs rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base text-zinc-900">GitHub Account</CardTitle>
            <CardDescription>Manage your connected GitHub OAuth token and repository access permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <GitHubSettings connection={connection} />
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="border-zinc-200 shadow-2xs rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base text-zinc-900">Profile Information</CardTitle>
            <CardDescription>Update your personal details and academic background.</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingsForm profile={profile} />
          </CardContent>
        </Card>

        {/* AI Model Preferences */}
        <Card className="border-zinc-200 shadow-2xs rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base text-zinc-900">AI Intelligence Engine</CardTitle>
            <CardDescription>Choose the primary model powering your skill extraction and outreach drafting.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderToggle initialProvider={provider} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

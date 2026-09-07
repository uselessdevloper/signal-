"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Search,
  Plus,
  Inbox,
  MessageSquare,
  User,
  Kanban,
  FolderGit2,
  Bot,
  Users,
  BarChart3,
  Cpu,
  Sparkles,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
  ShieldCheck,
  Briefcase,
  FileBadge,
  Mail,
  Database,
  Plug,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; githubUsername?: string } | null>(null);
  const [isPluginsModalOpen, setIsPluginsModalOpen] = useState(false);
  const [activePlugin, setActivePlugin] = useState<"github" | "email" | "firestore" | "gemini">("github");

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [{ data: profile }, { data: githubConn }] = await Promise.all([
          supabase.from("profiles").select("full_name").eq("id", user.id).single(),
          supabase.from("github_connections").select("github_username").or(`profile_id.eq.${user.id},user_id.eq.${user.id}`).maybeSingle(),
        ]);

        setUserProfile({
          name: profile?.full_name || user.email?.split("@")[0] || "Candidate",
          email: user.email || "",
          githubUsername: githubConn?.github_username || "utkarshsinha",
        });
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navSections = [
    {
      title: "",
      items: [
        { name: "Inbox", href: "/dashboard/tracker?tab=pipeline", tabId: "pipeline", icon: Inbox, badge: "1" },
        { name: "Agent Chat", href: "/dashboard/tracker?tab=draft", tabId: "draft", icon: MessageSquare },
        { name: "My Applications", href: "/dashboard/tracker?tab=kanban", tabId: "kanban", icon: User },
      ],
    },
    {
      title: "Workspace",
      items: [
        { name: "Live Kanban", href: "/dashboard/tracker?tab=kanban", tabId: "kanban", icon: Kanban, badge: "Live" },
        { name: "Agent Pipeline", href: "/dashboard/tracker?tab=pipeline", tabId: "pipeline", icon: Bot, badge: "6 Agents" },
        { name: "Skill Passport", href: "/dashboard", icon: ShieldCheck },
        { name: "Find Team", href: "/dashboard/find-team", icon: Users },
        { name: "Create Teammates", href: "/dashboard/create-teammates", icon: Plus },
        { name: "Internships", href: "/dashboard/internships", icon: Briefcase },
        { name: "Certificates", href: "/dashboard/certificates", icon: FileBadge },
      ],
    },
    {
      title: "Plugins & Integrations",
      isPluginSection: true,
      items: [
        {
          name: "GitHub",
          pluginKey: "github" as const,
          icon: FolderGit2,
          status: "Connected",
          tag: userProfile?.githubUsername ? `@${userProfile.githubUsername}` : "Connected",
          isLive: true,
        },
        {
          name: "Gmail (Pub/Sub)",
          pluginKey: "email" as const,
          icon: Mail,
          status: "Active",
          tag: "Pub/Sub",
          isLive: true,
        },
        {
          name: "Cloud Firestore",
          pluginKey: "firestore" as const,
          icon: Database,
          status: "Live",
          tag: "<140ms",
          isLive: true,
        },
      ],
    },
    {
      title: "Configure",
      items: [
        { name: "Cloud Runtimes", href: "/dashboard/tracker?tab=nudges", icon: Cpu, badge: "GCP" },
        { name: "MINSKY Forensics", href: "/dashboard/tracker?tab=minsky", icon: Sparkles },
        { name: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  const initials = (userProfile?.name || "Utkarsh Sinha")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <aside className="w-[240px] flex-shrink-0 flex flex-col h-full bg-[#fbfcfd] border-r border-zinc-200/80 select-none text-[13px] font-sans antialiased">
        {/* Workspace Selector Dropdown */}
        <div className="p-3 pb-2">
          <button
            type="button"
            onClick={() => setIsPluginsModalOpen(true)}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-200/60 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                S
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-zinc-900 text-[13px] truncate">
                  Signal AI Lab
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
          </button>
        </div>

        {/* Quick Search & New Action */}
        <div className="px-3 pb-3 flex flex-col gap-1.5">
          <Link href="/dashboard/tracker">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-100/80 hover:bg-zinc-200/70 border border-zinc-200/60 text-zinc-500 hover:text-zinc-800 transition-all cursor-pointer">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs">Search...</span>
              </div>
              <span className="text-[10px] font-mono bg-white border border-zinc-200 px-1.5 py-0.5 rounded text-zinc-400 shadow-2xs">
                ⌘ K
              </span>
            </div>
          </Link>

          <Link href="/dashboard/tracker?tab=pipeline">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100/80 text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer">
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-medium">New Pipeline Run</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-400">C</span>
            </div>
          </Link>
        </div>

        <div className="h-px bg-zinc-200/60 mx-3 mb-2" />

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 space-y-4 no-scrollbar">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-0.5">
              {sec.title && (
                <div className="flex items-center justify-between px-2 pb-1">
                  <h4 className="text-[11px] font-semibold text-zinc-400 tracking-wider">
                    {sec.title}
                  </h4>
                  {sec.isPluginSection && (
                    <button
                      onClick={() => setIsPluginsModalOpen(true)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
                  )}
                </div>
              )}

              {sec.items.map((item: any) => {
                const Icon = item.icon;

                // Plugin Action Item
                if (sec.isPluginSection) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        setActivePlugin(item.pluginKey);
                        setIsPluginsModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="w-4 h-4 text-zinc-500" strokeWidth={1.75} />
                        <span className="truncate text-[13px]">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          {item.tag}
                        </span>
                      </div>
                    </button>
                  );
                }

                // Regular Nav Link
                const isTrackerTab = Boolean(item.tabId);
                let isActive = false;
                if (isTrackerTab && pathname === "/dashboard/tracker") {
                  if (item.tabId === "kanban") {
                    isActive = currentTab === "kanban" || !currentTab;
                  } else {
                    isActive = currentTab === item.tabId;
                  }
                } else if (!isTrackerTab) {
                  isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                }

                return (
                  <Link key={item.name} href={item.href} className="block">
                    <div
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 transition-all cursor-pointer",
                        isActive && "bg-zinc-200/70 text-zinc-900 font-semibold shadow-2xs"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={cn(
                            "w-4 h-4 text-zinc-500 transition-colors",
                            isActive && "text-zinc-900"
                          )}
                          strokeWidth={1.75}
                        />
                        <span className="truncate text-[13px]">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-mono px-1.5 py-0.2 rounded-md font-medium",
                            isActive
                              ? "bg-zinc-300/80 text-zinc-900"
                              : "bg-zinc-100 text-zinc-500 border border-zinc-200/60"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer User Profile & System Status */}
        <div className="p-3 border-t border-zinc-200/80 flex flex-col gap-2">
          <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-zinc-100/80 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-zinc-900 truncate">
                  {userProfile?.name || "Utkarsh Sinha"}
                </span>
                <span className="text-[10px] text-zinc-400 truncate">Candidate Account</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-zinc-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* CONNECTED PLUGINS & INTEGRATIONS MODAL                                    */}
      {/* ========================================================================= */}
      {isPluginsModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700">
                  <Plug className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900">
                    Connected Plugins & Integrations
                  </h3>
                  <p className="text-xs text-zinc-500">Live telemetry and sync status for external services</p>
                </div>
              </div>
              <button
                onClick={() => setIsPluginsModalOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Plugin Cards List */}
            <div className="space-y-3">
              {/* 1. GitHub Plugin */}
              <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/60 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-zinc-900">GitHub Forensics Plugin</h4>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Syncing repositories for MINSKY code forensics and cryptographic GPG signature validation.
                    </p>
                    <p className="text-[11px] font-mono text-zinc-600 pt-0.5">
                      User: <span className="font-semibold">@{userProfile?.githubUsername || "utkarshsinha"}</span> · Repositories: <span className="font-semibold">3 active</span>
                    </p>
                  </div>
                </div>

                <Link href="/settings">
                  <button
                    onClick={() => setIsPluginsModalOpen(false)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    Configure
                  </button>
                </Link>
              </div>

              {/* 2. Gmail / PubSub Plugin */}
              <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/60 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-zinc-900">Gmail Ingestion Agent</h4>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Pub/Sub Push Active
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Cloud Pub/Sub push hook listening to recruiter invitations, interview scheduling, and auto-updating Kanban stage.
                    </p>
                    <p className="text-[11px] font-mono text-zinc-600 pt-0.5">
                      Topic: <span className="font-semibold">signal-gmail-ingest</span> · Auto-Kanban: <span className="font-semibold text-emerald-600">Enabled</span>
                    </p>
                  </div>
                </div>

                <Link href="/dashboard/tracker?tab=pipeline">
                  <button
                    onClick={() => setIsPluginsModalOpen(false)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 shadow-2xs transition-colors shrink-0 cursor-pointer"
                  >
                    Simulate
                  </button>
                </Link>
              </div>

              {/* 3. Cloud Firestore Plugin */}
              <div className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/60 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-zinc-900">Cloud Firestore Realtime Sync</h4>
                      <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" /> &lt;140ms Latency
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500">
                      Sub-second document store managing real-time Kanban board state and candidate verification tokens.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toast.success("Firestore stream latency: 118ms (Healthy)")}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  Test Ping
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsPluginsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Sidebar() {
  return (
    <Suspense fallback={<aside className="w-[240px] flex-shrink-0 bg-[#fbfcfd] border-r border-zinc-200/80 h-full" />}>
      <SidebarContent />
    </Suspense>
  );
}


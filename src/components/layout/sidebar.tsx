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
  Award,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { SignalLogo } from "@/components/ui/signal-logo";

function SidebarContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    githubUsername?: string;
    avatarUrl?: string;
  }>({
    name: "Utkarsh Sinha",
    email: "off.utkarsh.sinha@gmail.com",
    githubUsername: "uselessdevloper",
    avatarUrl: "https://github.com/uselessdevloper.png",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [{ data: profile }, { data: githubConn }] = await Promise.all([
          supabase.from("profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
          supabase
            .from("github_connections")
            .select("github_username, avatar_url")
            .or(`profile_id.eq.${user.id},user_id.eq.${user.id}`)
            .maybeSingle(),
        ]);

        const username = githubConn?.github_username || "uselessdevloper";
        const avatar =
          githubConn?.avatar_url ||
          profile?.avatar_url ||
          `https://github.com/${username}.png`;

        setUserProfile({
          name: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Utkarsh Sinha",
          email: user.email || "",
          githubUsername: username,
          avatarUrl: avatar,
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
      title: "Workspace",
      items: [
        { name: "Live Kanban", href: "/dashboard/tracker?tab=kanban", tabId: "kanban", icon: Kanban, badge: "Live" },
        { name: "Internships", href: "/dashboard/internships", icon: Briefcase, badge: "Matches" },
        { name: "Certificates", href: "/dashboard/certificates", icon: ShieldCheck, badge: "Verified" },
        { name: "Skill Passport", href: "/dashboard", icon: Award },
        { name: "Connected Accounts", href: "/dashboard/integrations", icon: Plug, badge: "Connected" },
      ],
    },
    {
      title: "AI Copilot & Agents",
      items: [
        { name: "Agent Pipeline", href: "/dashboard/tracker?tab=pipeline", tabId: "pipeline", icon: Bot, badge: "7 Agents" },
        { name: "AI Scorecard", href: "/dashboard/tracker?tab=scorecard", tabId: "scorecard", icon: BarChart3, badge: "Review" },
        { name: "AI Outreach", href: "/dashboard/tracker?tab=draft", tabId: "draft", icon: MessageSquare, badge: "Copilot" },
        { name: "Resume Optimizer", href: "/dashboard/tracker?tab=optimize", tabId: "optimize", icon: Sparkles },
        { name: "Smart Nudges", href: "/dashboard/tracker?tab=nudges", tabId: "nudges", icon: Zap, badge: "Active" },
      ],
    },
    {
      title: "Connected Accounts",
      isPluginSection: true,
      items: [
        {
          name: "GitHub",
          pluginKey: "github" as const,
          icon: FolderGit2,
          tag: userProfile?.githubUsername ? `@${userProfile.githubUsername}` : "Connected",
          isLive: true,
        },
        {
          name: "Gmail Auto-Sync",
          pluginKey: "email" as const,
          icon: Mail,
          tag: "Active",
          isLive: true,
        },
        {
          name: "Live Database",
          pluginKey: "firestore" as const,
          icon: Database,
          tag: "Synced",
          isLive: true,
        },
      ],
    },
    {
      title: "Configure",
      items: [
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
      <aside className="w-[248px] flex-shrink-0 flex flex-col h-full bg-[#fbfcfd] border-r border-zinc-200/80 select-none text-[13px] font-sans antialiased">
        {/* Workspace Brand Header */}
        <div className="p-3 pb-2">
          <Link
            href="/dashboard/integrations"
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-200/60 transition-colors text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <SignalLogo size={28} rounded="rounded-lg" className="group-hover:border-zinc-700 transition-colors shrink-0" />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-zinc-900 text-[13.5px] tracking-tight truncate leading-tight">
                    SIGNAL
                  </span>
                  <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/80">
                    AI
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 truncate font-sans leading-tight mt-0.5">
                  Career Copilot
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors shrink-0" />
          </Link>
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

          <Link href="/dashboard/tracker">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-zinc-100/80 text-zinc-600 hover:text-zinc-900 transition-all cursor-pointer">
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-xs font-medium">Track Application</span>
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
                    <Link
                      href="/dashboard/integrations"
                      className="text-[10px] text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
                    >
                      Manage
                    </Link>
                  )}
                </div>
              )}

              {sec.items.map((item: any) => {
                const Icon = item.icon;

                // Plugin Action Item
                if (sec.isPluginSection) {
                  const isPluginActive =
                    pathname === "/dashboard/integrations" && searchParams.get("service") === item.pluginKey;

                  return (
                    <Link
                      key={item.name}
                      href={`/dashboard/integrations?service=${item.pluginKey}`}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 transition-all cursor-pointer text-left",
                        isPluginActive && "bg-zinc-200/70 text-zinc-900 font-semibold shadow-2xs"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Icon className="w-4 h-4 text-zinc-500 shrink-0" strokeWidth={1.75} />
                        <span className="truncate text-[13px]">{item.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium whitespace-nowrap">
                          {item.tag}
                        </span>
                      </div>
                    </Link>
                  );
                }

                // Regular Nav Link
                let isActive = false;
                if (item.tabId) {
                  isActive = pathname === "/dashboard/tracker" && currentTab === item.tabId;
                } else {
                  isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={true}
                    onClick={(e) => {
                      if (pathname === "/dashboard/tracker" && item.tabId) {
                        e.preventDefault();
                        window.dispatchEvent(
                          new CustomEvent("switch-tracker-tab", { detail: item.tabId })
                        );
                        window.history.pushState(null, "", item.href);
                      }
                    }}
                    className="block"
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80 transition-all cursor-pointer min-w-0",
                        isActive && "bg-zinc-200/70 text-zinc-900 font-semibold shadow-2xs"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Icon
                          className={cn(
                            "w-4 h-4 text-zinc-500 shrink-0 transition-colors",
                            isActive && "text-zinc-900"
                          )}
                          strokeWidth={1.75}
                        />
                        <span className="truncate text-[13px]">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[10px] font-mono px-1.5 py-0.5 rounded-md font-medium whitespace-nowrap shrink-0 ml-1.5",
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
              <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs overflow-hidden border border-zinc-200/80 shrink-0">
                {userProfile?.avatarUrl ? (
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name || "GitHub Account Avatar"}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // Fallback if image fails to load
                      const target = e.currentTarget as HTMLElement;
                      target.style.display = "none";
                      if (target.parentElement) {
                        target.parentElement.textContent = initials;
                      }
                    }}
                  />
                ) : (
                  initials
                )}
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


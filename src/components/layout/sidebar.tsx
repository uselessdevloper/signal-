"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  UserCircle,
  Users,
  UserPlus,
  Briefcase,
  FileBadge,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Kanban,
  Bot,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SIDEBAR_ITEMS = [
  { name: "Live Kanban Board", href: "/dashboard/tracker?tab=kanban", icon: Kanban, color: "text-sky-300", badge: "Live" },
  { name: "Signal Multi-Agent", href: "/dashboard/tracker", icon: Bot, color: "text-blue-400", badge: "6 Agents" },
  { name: "Skill Card", href: "/dashboard", icon: UserCircle, color: "text-violet-300" },
  { name: "Find Team", href: "/dashboard/find-team", icon: Users, color: "text-emerald-300" },
  { name: "Create Teammates", href: "/dashboard/create-teammates", icon: UserPlus, color: "text-teal-300" },
  { name: "Internships", href: "/dashboard/internships", icon: Briefcase, color: "text-amber-300" },
  { name: "Certificates", href: "/dashboard/certificates", icon: FileBadge, color: "text-pink-300" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single();
        setUserProfile({
          name: profile?.full_name || user.email?.split("@")[0] || "Jane Doe",
          avatar: profile?.avatar_url || "https://github.com/shadcn.png",
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

  const NavItem = ({ item }: { item: (typeof SIDEBAR_ITEMS)[number] }) => {
    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("?")[0]));
    const Icon = item.icon;

    return (
      <Link href={item.href} className="w-full">
        <div
          className={cn(
            "flex items-center rounded-lg transition-all duration-150 group cursor-pointer relative",
            isCollapsed ? "justify-center p-3" : "px-3 py-2.5 gap-3",
            isActive
              ? "bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
              : "text-white/60 hover:bg-white/[0.06] hover:text-white"
          )}
        >
          {isActive && (
            <motion.span
              layoutId="active-pill"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-[#006ddf] rounded-full"
            />
          )}

          <Icon
            className={cn(
              "flex-shrink-0 transition-colors",
              isActive ? item.color : "text-white/40 group-hover:text-white/70",
              isCollapsed ? "w-[18px] h-[18px]" : "w-[16px] h-[16px]"
            )}
            strokeWidth={2}
          />

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex items-center gap-auto flex-1 overflow-hidden whitespace-nowrap"
              >
                <span className="font-medium text-[13px] font-mono flex-1">{item.name}</span>
                {item.badge && (
                  <span className={cn(
                    "ml-auto text-[10px] font-mono font-bold px-1.5 py-0.5 rounded",
                    isActive ? "bg-[#006ddf]/40 text-blue-200" : "bg-white/10 text-white/50"
                  )}>
                    {item.badge}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Link>
    );
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 68 : 244 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col h-full flex-shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-2xl"
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #1e222b 0%, #0d0f14 100%)",
      }}
    >
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-2.5 top-6 flex h-5 w-5 items-center justify-center rounded-full bg-[#006ddf] text-white shadow-md z-30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Header Logo */}
      <div
        className={cn(
          "flex items-center h-[64px] px-4 border-b border-white/[0.08] cursor-pointer",
          isCollapsed ? "justify-center px-0" : "gap-3"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="w-6 h-6 rounded bg-[#006ddf] flex items-center justify-center flex-shrink-0 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-[14px] text-white whitespace-nowrap font-mono tracking-widest uppercase">
                SIGNAL
              </span>
              <p className="text-[9px] text-[#006ddf] font-mono tracking-wider uppercase font-semibold">
                SYSTEM 001 · AGENTS
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-3.5 flex flex-col gap-1">
        {SIDEBAR_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-2.5 border-t border-white/[0.08] flex flex-col gap-1">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center rounded-lg transition-all w-full text-white/50 hover:bg-red-500/15 hover:text-red-300 font-mono text-xs",
            isCollapsed ? "justify-center p-2.5" : "px-2.5 py-2 gap-2.5"
          )}
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div
          className={cn(
            "flex items-center rounded-lg mt-0.5",
            isCollapsed ? "justify-center p-1.5" : "px-2 py-1.5 gap-2.5"
          )}
        >
          <div className="w-7 h-7 rounded bg-[#006ddf]/20 border border-[#006ddf]/40 overflow-hidden flex-shrink-0 flex items-center justify-center text-white font-mono text-xs font-bold">
            JD
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col overflow-hidden whitespace-nowrap font-mono"
              >
                <span className="text-xs font-semibold text-white/90 truncate">
                  {userProfile?.name || "Jane Doe"}
                </span>
                <span className="text-[10px] text-white/40">Verified Candidate</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

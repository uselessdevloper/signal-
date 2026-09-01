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
  { name: "Skill Card", href: "/dashboard", icon: UserCircle, color: "text-violet-300" },
  { name: "Signal Multi-Agent", href: "/dashboard/tracker", icon: Bot, color: "text-indigo-300", badge: "6 Agents" },
  { name: "Live Kanban", href: "/dashboard/tracker?tab=kanban", icon: Kanban, color: "text-sky-300" },
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
          name: profile?.full_name || user.email?.split("@")[0] || "User",
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
            "flex items-center rounded-xl transition-all duration-150 group cursor-pointer relative",
            isCollapsed ? "justify-center p-3" : "px-3 py-2.5 gap-3",
            isActive
              ? "bg-white/[0.12] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]"
              : "text-white/55 hover:bg-white/[0.07] hover:text-white/90"
          )}
        >
          {isActive && (
            <motion.span
              layoutId="active-pill"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-indigo-400 rounded-full"
            />
          )}

          <Icon
            className={cn(
              "flex-shrink-0 transition-colors",
              isActive ? item.color : "text-white/40 group-hover:text-white/70",
              isCollapsed ? "w-[20px] h-[20px]" : "w-[17px] h-[17px]"
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
                <span className="font-medium text-[13px] flex-1">{item.name}</span>
                {item.badge && isActive && (
                  <span className="ml-auto text-[10px] font-semibold bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded-md">
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
      animate={{ width: isCollapsed ? 72 : 252 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col h-full flex-shrink-0 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, oklch(0.21 0.09 272) 0%, oklch(0.17 0.07 268) 100%)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.18)",
      }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg z-30 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {isCollapsed
          ? <ChevronRight className="w-[13px] h-[13px]" />
          : <ChevronLeft className="w-[13px] h-[13px]" />}
      </button>

      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-[68px] px-5 border-b border-white/[0.07] cursor-pointer",
          isCollapsed ? "justify-center px-0" : "gap-3"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-md">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <span className="font-semibold text-[15px] text-white whitespace-nowrap tracking-tight">
                Signal
              </span>
              <p className="text-[10px] text-white/35 whitespace-nowrap font-medium tracking-wide uppercase mt-px">
                Multi-Agent Career AI
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 flex flex-col gap-1">
        {SIDEBAR_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} />
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-3 border-t border-white/[0.07] flex flex-col gap-1">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center rounded-xl transition-all w-full text-white/45 hover:bg-red-500/15 hover:text-red-300",
            isCollapsed ? "justify-center p-3" : "px-3 py-2.5 gap-3"
          )}
        >
          <LogOut className="w-[17px] h-[17px] flex-shrink-0" strokeWidth={2} />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium text-[13px] whitespace-nowrap overflow-hidden"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div
          className={cn(
            "flex items-center rounded-xl mt-1",
            isCollapsed ? "justify-center p-2" : "px-2 py-2 gap-3"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 overflow-hidden flex-shrink-0 shadow-md">
            <img
              src={userProfile?.avatar || "https://github.com/shadcn.png"}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col overflow-hidden whitespace-nowrap"
              >
                <span className="text-[13px] font-medium text-white/90">
                  {userProfile?.name || "Guest User"}
                </span>
                <span className="text-[10px] text-white/35">Developer</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

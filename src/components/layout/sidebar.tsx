"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard,
  User,
  Settings,
  UserCircle,
  Users,
  UserPlus,
  Briefcase,
  FileBadge,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Kanban,
  Bot
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const SIDEBAR_ITEMS = [
  { name: "Skill Card", href: "/dashboard", icon: UserCircle },
  { name: "Signal Multi-Agent", href: "/dashboard/tracker", icon: Bot },
  { name: "Live Kanban Board", href: "/dashboard/tracker?tab=kanban", icon: Kanban },
  { name: "Find Team", href: "/dashboard/find-team", icon: Users },
  { name: "Create Teammates", href: "/dashboard/create-teammates", icon: UserPlus },
  { name: "Internships", href: "/dashboard/internships", icon: Briefcase },
  { name: "Certificates", href: "/dashboard/certificates", icon: FileBadge },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState<{name: string, avatar: string} | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', user.id).single();
        setUserProfile({
          name: profile?.full_name || user.email?.split('@')[0] || "User",
          avatar: profile?.avatar_url || "https://github.com/shadcn.png"
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

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <Link href={item.href} className="w-full">
        <div
          className={cn(
            "flex items-center rounded-[8px] transition-colors group cursor-pointer relative",
            isCollapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3",
            isActive
              ? "bg-white/[0.04] text-white"
              : "text-white/65 hover:bg-white/[0.04] hover:text-white"
          )}
        >
          <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={2} />
          
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium text-[13px] whitespace-nowrap overflow-hidden"
              >
                {item.name}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Link>
    );
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="group relative flex flex-col h-full bg-[#0f0f0f] border border-white/[0.08] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)] flex-shrink-0 rounded-[20px]"
    >
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        className="absolute -right-3 top-7 flex h-6 w-6 items-center justify-center rounded-full bg-[#18181b] border border-white/[0.08] text-white/65 hover:text-white transition-all z-30 opacity-0 group-hover:opacity-100 shadow-md"
      >
        {isCollapsed ? <ChevronRight className="w-[14px] h-[14px]" /> : <ChevronLeft className="w-[14px] h-[14px]" />}
      </button>

      {/* Top: Logo */}
      <div 
        className={cn(
          "flex items-center h-20 px-6",
          isCollapsed ? "justify-center px-0" : "justify-between"
        )}
        onClick={handleToggle}
      >
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
          <div className="w-7 h-7 bg-white rounded-[6px] flex items-center justify-center flex-shrink-0" />
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-[14px] text-white whitespace-nowrap overflow-hidden"
              >
                Signal
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Middle: Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 flex flex-col gap-2">
        {SIDEBAR_ITEMS.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Bottom: User Profile & Logout */}
      <div className="p-4 border-t border-white/[0.08] mt-auto flex flex-col gap-2">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center rounded-[8px] transition-colors group cursor-pointer w-full text-white/65 hover:bg-red-500/10 hover:text-red-400",
            isCollapsed ? "justify-center p-3" : "px-3 py-2.5 space-x-3"
          )}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0 group-hover:text-red-400 text-white/65" strokeWidth={2} />
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

        <div className={cn(
          "flex items-center rounded-[8px] transition-colors mt-2",
          isCollapsed ? "justify-center" : "px-2 py-2 space-x-3"
        )}>
          <div className="w-8 h-8 rounded-full bg-cyan-500 overflow-hidden flex-shrink-0">
            <img src={userProfile?.avatar || "https://github.com/shadcn.png"} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="flex flex-col overflow-hidden whitespace-nowrap"
              >
                <span className="text-[13px] font-medium text-white">{userProfile?.name || "Guest User"}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

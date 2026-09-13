"use client";

import type { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn, getInitials } from "@/lib/utils";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  user: User;
  collapsed: boolean;
}

export function UserMenu({ user, collapsed }: UserMenuProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const displayName =
    user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const email = user.email || "";
  const avatarUrl = user.user_metadata?.avatar_url || "https://github.com/uselessdevloper.png";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent outline-none",
          collapsed && "justify-center px-2"
        )}
      >
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={avatarUrl} alt={displayName} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        {!collapsed && (
          <div className="flex-1 text-left">
            <p className="truncate font-medium text-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{displayName}</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/passport")}>
          <UserIcon className="mr-2 h-4 w-4" />
          My Passport
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

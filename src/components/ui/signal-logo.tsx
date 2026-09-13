"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SignalLogoProps {
  className?: string;
  size?: number;
  rounded?: string;
  transparent?: boolean;
}

export function SignalLogo({
  className,
  size = 28,
  rounded = "rounded-lg",
  transparent = false,
}: SignalLogoProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-black shrink-0 border border-zinc-900 shadow-2xs",
        rounded,
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={transparent ? "/logo-transparent.png" : "/logo.png"}
        alt="SIGNAL"
        width={size * 2}
        height={size * 2}
        className="w-full h-full object-cover"
        priority
      />
    </div>
  );
}

export function SignalBrand({
  className,
  logoSize = 28,
  showTag = true,
  subtitle = "Career Copilot",
}: {
  className?: string;
  logoSize?: number;
  showTag?: boolean;
  subtitle?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <SignalLogo size={logoSize} />
      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="font-extrabold text-zinc-950 tracking-tight font-mono text-[14px]">
            SIGNAL
          </span>
          {showTag && (
            <span className="text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200/80">
              AI
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-[10px] text-zinc-400 truncate font-sans leading-tight mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}

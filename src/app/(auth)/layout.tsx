import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-gradient-to-b from-zinc-50 via-zinc-100/60 to-zinc-200/50 p-4 sm:p-6 antialiased selection:bg-zinc-900 selection:text-white">
      {/* Ambient background glow & subtle grid */}
      <div 
        className="absolute inset-0 z-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:20px_20px] opacity-60"
        aria-hidden="true" 
      />
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-red-500/10 via-blue-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

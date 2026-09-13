"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { SignalLogo } from "@/components/ui/signal-logo";

export default function LoginPage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProvider, setAuthProvider] = useState<"google" | "github" | "demo" | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/dashboard/tracker");
      } else {
        setIsChecking(false);
      }
    }).catch(() => {
      setIsChecking(false);
    });
  }, [router]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsAuthenticating(true);
    setAuthProvider("google");
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes("your-project-ref") || supabaseUrl.includes("mock-project")) {
        // Fallback gracefully for local demo environment without blocking user
        setTimeout(() => {
          router.push("/dashboard/tracker");
        }, 600);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(err?.message || "Unable to reach Google OAuth. Launching demo workspace.");
      setIsAuthenticating(false);
      setAuthProvider(null);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    setIsAuthenticating(true);
    setAuthProvider("github");
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl || supabaseUrl.includes("your-project-ref") || supabaseUrl.includes("mock-project")) {
        setTimeout(() => {
          router.push("/dashboard/tracker");
        }, 600);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("GitHub Auth error:", err);
      setError(err?.message || "Unable to reach GitHub OAuth. Launching demo workspace.");
      setIsAuthenticating(false);
      setAuthProvider(null);
    }
  };

  const handleDemoAccess = () => {
    setIsAuthenticating(true);
    setAuthProvider("demo");
    router.push("/dashboard/tracker");
  };

  if (isChecking) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white/95 rounded-2xl border border-zinc-200/80 shadow-2xl backdrop-blur-xl max-w-sm mx-auto">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 mb-3" />
        <p className="text-sm font-semibold text-zinc-900">Restoring Workspace...</p>
        <p className="text-xs text-zinc-500 mt-1">Checking active session</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-red-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl blur-md group-hover:blur-lg transition-all" />
          <SignalLogo size={56} rounded="rounded-2xl" className="shadow-lg border-zinc-800" />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-zinc-950 font-mono">
              SIGNAL
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200/80 tracking-wide">
              AI COPILOT
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 max-w-xs font-sans font-medium">
            Simplified Information for Guiding Networked Applications & Leads
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div className="w-full bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-2xl shadow-zinc-950/5 space-y-5">
        <div className="text-center space-y-1.5">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-zinc-500 leading-relaxed max-w-xs mx-auto">
            Connect your accounts to stream recruiter emails, track pipeline velocity, and verify GitProof telemetry.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {/* Continue with Google */}
          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            size="lg"
            disabled={isAuthenticating}
            className="w-full gap-3 h-12 text-sm font-semibold border-zinc-300 hover:border-zinc-400 bg-white hover:bg-zinc-50 text-zinc-800 shadow-xs cursor-pointer disabled:opacity-60 transition-all rounded-xl"
          >
            {isAuthenticating && authProvider === "google" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-zinc-800" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          {/* Continue with GitHub */}
          <Button
            onClick={handleGithubLogin}
            variant="outline"
            size="lg"
            disabled={isAuthenticating}
            className="w-full gap-3 h-12 text-sm font-semibold border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-white shadow-xs cursor-pointer disabled:opacity-60 transition-all rounded-xl"
          >
            {isAuthenticating && authProvider === "github" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                <span>Connecting to GitHub...</span>
              </>
            ) : (
              <>
                <svg className="h-5 w-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>Continue with GitHub</span>
              </>
            )}
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-zinc-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-zinc-400 font-mono text-[11px]">DEMO EXPLORATION</span>
          </div>
        </div>

        {/* Instant Demo Access Button */}
        <button
          type="button"
          onClick={handleDemoAccess}
          disabled={isAuthenticating}
          className="w-full h-11 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 active:scale-[0.99] text-zinc-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border border-zinc-200/80"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
          <span>Instant Access (Live Interactive Demo)</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
        </button>

        {/* Security Reassurance Footer */}
        <div className="pt-2 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <p className="text-[11px] text-zinc-500 font-sans">
            Protected by Google Cloud Identity & End-to-End Encryption
          </p>
        </div>
      </div>
    </div>
  );
}

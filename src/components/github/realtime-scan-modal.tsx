"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Cpu,
  FolderGit2,
  Sparkles,
  Zap,
  Code2,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RealtimeScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  githubUsername?: string;
  onComplete?: () => void;
}

const SCAN_STEPS = [
  { label: "Authenticating OAuth Handshake", icon: ShieldCheck, delay: 600 },
  { label: "Discovering multi-branch repositories & commits", icon: FolderGit2, delay: 1200 },
  { label: "Parsing AST across .ts, .py, .go, .rs, .java, .cpp", icon: Code2, delay: 2000 },
  { label: "Running GitProof Anti-Cheat & Hamiltonian Graph scoring", icon: Cpu, delay: 2800 },
  { label: "Mapping target role competency (Backend/Full-Stack)", icon: Sparkles, delay: 3500 },
];

const MOCK_REPOS_STREAM = [
  { name: "api-gateway-service", lang: "Go", lines: "14,200 loc", integrity: "100%" },
  { name: "distributed-cache-redis", lang: "TypeScript", lines: "8,940 loc", integrity: "99%" },
  { name: "auth-microservice-jwt", lang: "Python", lines: "5,320 loc", integrity: "98%" },
  { name: "postgres-sharding-engine", lang: "SQL/Rust", lines: "12,100 loc", integrity: "100%" },
  { name: "event-stream-kafka", lang: "Java", lines: "9,450 loc", integrity: "97%" },
];

export function RealtimeScanModal({
  isOpen,
  onClose,
  githubUsername = "developer",
  onComplete,
}: RealtimeScanModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);
  const [scannedRepos, setScannedRepos] = useState<typeof MOCK_REPOS_STREAM>([]);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setProgress(12);
      setScannedRepos([]);
      setIsFinished(false);
      return;
    }

    let p = 15;
    const progressTimer = setInterval(() => {
      p = Math.min(p + Math.floor(Math.random() * 8) + 4, 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(progressTimer);
        setIsFinished(true);
        if (onComplete) onComplete();
      }
    }, 300);

    // Stream steps
    SCAN_STEPS.forEach((step, idx) => {
      setTimeout(() => {
        setCurrentStepIndex(idx);
      }, step.delay);
    });

    // Stream repos
    MOCK_REPOS_STREAM.forEach((repo, idx) => {
      setTimeout(() => {
        setScannedRepos((prev) => [...prev, repo]);
      }, 700 + idx * 600);
    });

    return () => clearInterval(progressTimer);
  }, [isOpen, onComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl bg-white border border-zinc-200 text-zinc-900 p-0 overflow-hidden shadow-2xl rounded-2xl sm:rounded-2xl">
        {/* Window Header */}
        <div className="bg-zinc-50/90 px-5 py-3.5 border-b border-zinc-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-400/90 shadow-2xs" />
            <div className="w-3 h-3 rounded-full bg-amber-400/90 shadow-2xs" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-2xs" />
            <span className="text-xs font-mono text-zinc-600 ml-2 flex items-center gap-1.5 font-medium">
              <Terminal className="w-3.5 h-3.5 text-blue-600" />
              gitproof://scan/{githubUsername}
            </span>
          </div>

          <span className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            {progress}% COMPLETED
          </span>
        </div>

        <div className="p-6 space-y-5 bg-white">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-600 flex items-center gap-1.5 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                Live Portfolio Deep Scanner
              </span>
              <span className="text-emerald-600 font-bold">{isFinished ? "✓ READY" : "SCANNING..."}</span>
            </div>
            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/80">
              <div
                className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stepper Process */}
          <div className="space-y-1.5 bg-zinc-50/80 p-3 rounded-xl border border-zinc-200/80">
            {SCAN_STEPS.map((s, idx) => {
              const StepIcon = s.icon;
              const isDone = idx < currentStepIndex || isFinished;
              const isCurrent = idx === currentStepIndex && !isFinished;

              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-3 text-xs transition-all px-2.5 py-1.5 rounded-lg",
                    isCurrent && "bg-white text-blue-900 font-semibold border border-blue-200/80 shadow-2xs",
                    isDone && "text-zinc-800 font-medium",
                    idx > currentStepIndex && "text-zinc-400"
                  )}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : isCurrent ? (
                    <StepIcon className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center text-[9px] text-zinc-400 font-medium">
                      {idx + 1}
                    </div>
                  )}
                  <span className="truncate">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Live Scanned Repos Stream */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500 font-mono font-medium">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-blue-600" />
                Live Codebase AST Stream
              </span>
              <span className="text-zinc-600 font-semibold">{scannedRepos.length} Repos Audited</span>
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {scannedRepos.map((repo, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-zinc-200 text-xs font-mono shadow-2xs hover:border-zinc-300 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="text-zinc-900 font-semibold truncate">{repo.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-zinc-100 text-zinc-700 font-medium border border-zinc-200">
                      {repo.lang}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
                    <span>{repo.lines}</span>
                    <span className="text-emerald-600 font-bold">{repo.integrity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finish Button */}
          {isFinished && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              View Role Competency Analysis
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

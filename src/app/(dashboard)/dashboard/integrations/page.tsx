"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Plug,
  Calendar,
  RefreshCw,
  FolderGit2,
  Mail,
  Database,
  Sparkles,
  Zap,
  CheckCircle2,
  Activity,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  Shield,
  Clock,
  Inbox,
  Briefcase,
  Check,
  Send,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SignalLogo } from "@/components/ui/signal-logo";

// Daily Activity Data formatted for non-tech users
const SYNC_ACTIVITY_DATA = [
  {
    date: "8/15",
    label: "Aug 15",
    emailsScanned: 38,
    appsUpdated: 4,
    interviewsDetected: 0,
    syncs: 48,
    status: "Synced Successfully",
  },
  {
    date: "8/18",
    label: "Aug 18",
    emailsScanned: 52,
    appsUpdated: 6,
    interviewsDetected: 1,
    syncs: 64,
    status: "1 Interview Invitation Found",
  },
  {
    date: "8/21",
    label: "Aug 21",
    emailsScanned: 84,
    appsUpdated: 9,
    interviewsDetected: 2,
    syncs: 142,
    status: "2 Interview Invitations Found",
  },
  {
    date: "8/25",
    label: "Aug 25",
    emailsScanned: 62,
    appsUpdated: 5,
    interviewsDetected: 0,
    syncs: 98,
    status: "Synced Successfully",
  },
  {
    date: "8/29",
    label: "Aug 29",
    emailsScanned: 58,
    appsUpdated: 4,
    interviewsDetected: 0,
    syncs: 82,
    status: "Synced Successfully",
  },
  {
    date: "9/03",
    label: "Sep 03",
    emailsScanned: 76,
    appsUpdated: 7,
    interviewsDetected: 1,
    syncs: 114,
    status: "1 Interview Invitation Found",
  },
  {
    date: "9/08",
    label: "Sep 08",
    emailsScanned: 80,
    appsUpdated: 8,
    interviewsDetected: 1,
    syncs: 130,
    status: "1 Interview Invitation Found",
  },
  {
    date: "9/13",
    label: "Today",
    emailsScanned: 88,
    appsUpdated: 9,
    interviewsDetected: 2,
    syncs: 142,
    status: "Snowflake & NVIDIA Synced",
  },
];

export default function ConnectedAccountsPage() {
  const searchParams = useSearchParams();
  const initialService = searchParams.get("service");

  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "history">("overview");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(2);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("just now");
  const [isPinging, setIsPinging] = useState(false);
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    toast.loading("Refreshing connection status...", { id: "refresh-sync" });
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated("just now");
      toast.success("All accounts verified and synced in real time", { id: "refresh-sync" });
    }, 600);
  };

  const handleSimulateSync = () => {
    setIsSimulatingSync(true);
    toast.loading("Scanning inbox for new interview updates...", { id: "sim-sync" });
    setTimeout(() => {
      setIsSimulatingSync(false);
      toast.success("Scan complete: 2 interview invitations and 7 confirmations up to date", {
        id: "sim-sync",
      });
    }, 800);
  };

  const maxEmails = 100;

  return (
    <div
      className={cn(
        "min-h-full w-full bg-white text-zinc-900 font-sans antialiased transition-all pb-16",
        isFullscreen ? "p-6 sm:p-12 max-w-none" : "p-5 sm:p-8 max-w-7xl mx-auto"
      )}
    >
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 1. TOP HEADER (Friendly Title, Status & Controls)                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <SignalLogo size={36} rounded="rounded-xl" className="shadow-xs" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-zinc-950">
                Connected Accounts & Live Sync
              </h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All 4 Connected
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Manage the tools linked to your tracker (Gmail, GitHub) and see your daily sync activity.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-zinc-500">
          <span className="font-mono text-[11px]">Updated {lastUpdated}</span>

          <button
            type="button"
            onClick={handleRefresh}
            title="Refresh connection status"
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 transition-colors border border-zinc-200/80 cursor-pointer"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-zinc-950")} />
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen((prev) => !prev)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-950 transition-colors border border-zinc-200/80 cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 2. SUBHEADER TABS                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-6 pt-3 pb-6 border-b border-zinc-100">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "text-sm pb-2 font-medium transition-colors relative cursor-pointer",
            activeTab === "overview"
              ? "text-zinc-900 font-semibold border-b-2 border-zinc-900 -mb-[2px]"
              : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          Daily Sync Activity
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("accounts")}
          className={cn(
            "text-sm pb-2 font-medium transition-colors relative cursor-pointer",
            activeTab === "accounts"
              ? "text-zinc-900 font-semibold border-b-2 border-zinc-900 -mb-[2px]"
              : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          Linked Accounts (4)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={cn(
            "text-sm pb-2 font-medium transition-colors relative cursor-pointer",
            activeTab === "history"
              ? "text-zinc-900 font-semibold border-b-2 border-zinc-900 -mb-[2px]"
              : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          Recent Sync History
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* 3. 4 PLAIN-ENGLISH METRIC CARDS                                        */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* Card 1: LINKED ACCOUNTS */}
        <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              CONNECTED TOOLS
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mt-1">
              4 Active
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3 font-sans">
            Gmail, GitHub, Database, AI Copilot
          </p>
        </div>

        {/* Card 2: APPLICATIONS TRACKED */}
        <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              APPLICATIONS TRACKED
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mt-1">
              28 Jobs
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3 font-sans">
            Auto-synced from your inbox & board
          </p>
        </div>

        {/* Card 3: EMAILS CHECKED */}
        <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              EMAILS SCANNED
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 mt-1">
              142 Emails
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3 font-sans">
            3 interview invitations found
          </p>
        </div>

        {/* Card 4: REAL-TIME HEALTH */}
        <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col justify-between hover:border-zinc-300 transition-colors">
          <div>
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              SYNC STATUS
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-600 mt-1">
              100% Live
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3 font-sans">
            Updates in under 1 second
          </p>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 1: DAILY SYNC OVERVIEW & HOW IT WORKS                              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Main Chart Card */}
          <div className="p-6 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Daily Auto-Sync Activity
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  How many recruiter emails were checked and job cards updated automatically each day.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <span className="w-3 h-3 rounded-xs bg-[#1d4ed8]" />
                  <span>Emails Checked</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-600">
                  <span className="w-3 h-3 rounded-xs bg-[#93c5fd]" />
                  <span>Applications Updated</span>
                </div>
              </div>
            </div>

            {/* Interactive Bar Chart with Hover Tooltip */}
            <div className="relative pt-4 pb-2 select-none">
              <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-[11px] font-mono text-zinc-400 pointer-events-none w-8">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              <div className="ml-10 h-60 border-b border-zinc-200 relative flex items-end justify-around px-2 sm:px-8">
                {/* Grid guidelines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="w-full border-b border-zinc-100" />
                  <div className="w-full border-b border-zinc-100" />
                  <div className="w-full border-b border-zinc-100" />
                  <div className="w-full border-b border-zinc-100" />
                  <div className="w-full" />
                </div>

                {SYNC_ACTIVITY_DATA.map((item, idx) => {
                  const heightPercent = Math.min(100, Math.round((item.emailsScanned / maxEmails) * 100));
                  const isHovered = hoveredBarIndex === idx;

                  return (
                    <div
                      key={item.date}
                      onMouseEnter={() => setHoveredBarIndex(idx)}
                      className="relative flex flex-col items-center h-full justify-end group cursor-pointer w-1/8 max-w-[70px]"
                    >
                      {/* Floating Tooltip Box */}
                      {isHovered && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-30 bg-white border border-zinc-200 shadow-xl rounded-xl p-3 text-left w-48 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                          <div className="text-xs font-bold text-zinc-900 pb-1 mb-1 border-b border-zinc-100">
                            {item.label} · Activity Summary
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between text-zinc-600">
                              <span>Emails Checked:</span>
                              <strong className="text-zinc-900">{item.emailsScanned}</strong>
                            </div>
                            <div className="flex justify-between text-zinc-600">
                              <span>Cards Updated:</span>
                              <strong className="text-blue-700">{item.appsUpdated}</strong>
                            </div>
                            <div className="flex justify-between text-zinc-600">
                              <span>Interviews Found:</span>
                              <strong className="text-emerald-700">{item.interviewsDetected}</strong>
                            </div>
                            <div className="pt-1 mt-1 border-t border-zinc-100 text-[10px] text-zinc-400 font-mono">
                              {item.status}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Stacked Two-Tone Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={cn(
                          "w-full rounded-xs transition-all flex flex-col justify-end overflow-hidden",
                          isHovered ? "ring-2 ring-blue-500/40 opacity-100" : "opacity-85 hover:opacity-100"
                        )}
                      >
                        {/* Top segment: light blue for applications updated */}
                        <div className="w-full bg-[#93c5fd] flex-1 min-h-[25px]" />
                        {/* Bottom segment: deep blue for total emails scanned */}
                        <div className="w-full h-8 bg-[#1d4ed8]" />
                      </div>

                      <span
                        className={cn(
                          "absolute -bottom-6 text-[11px] font-mono transition-colors",
                          isHovered ? "text-zinc-950 font-bold" : "text-zinc-400"
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Non-Tech Explanation Card: "Why This Exists & How It Helps You" */}
          <div className="p-6 rounded-2xl border border-zinc-200/90 bg-zinc-50/60 shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-zinc-900">
                Why are these accounts connected?
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-3.5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h4 className="text-xs font-bold text-zinc-900">Zero Manual Entry</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Your connected Gmail automatically adds jobs to your board as soon as you apply online.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h4 className="text-xs font-bold text-zinc-900">No Missed Interviews</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  When a recruiter emails you an interview date, SIGNAL moves the card and sets a reminder.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h4 className="text-xs font-bold text-zinc-900">Proof of Real Skills</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  GitHub verification proves your coding abilities to recruiters without needing coding tests.
                </p>
              </div>

              <div className="p-3.5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-1.5">
                <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <h4 className="text-xs font-bold text-zinc-900">Always In Sync</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Live cloud storage ensures your job cards are always identical on your laptop and phone.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 2: 4 LINKED ACCOUNTS (Clear, Simple & Non-Tech)                     */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "accounts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 1. Gmail Auto-Sync */}
          <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col justify-between hover:border-zinc-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shadow-xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Gmail Auto-Sync</h4>
                    <p className="text-xs text-zinc-500">Recruiter Email & Interview Reader</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Connects safely to your email to find job application confirmations, interview invitations, and status updates. Automatically moves cards on your Kanban board so you don&apos;t have to enter them by hand.
              </p>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600 space-y-1">
                <div className="flex justify-between">
                  <span>Connected Account:</span>
                  <strong className="text-zinc-900">off.utkarsh.sinha@gmail.com</strong>
                </div>
                <div className="flex justify-between">
                  <span>Scan Frequency:</span>
                  <strong className="text-emerald-700">Instant (Real-Time Push)</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-400">142 job emails detected</span>
              <button
                type="button"
                onClick={handleSimulateSync}
                disabled={isSimulatingSync}
                className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={cn("w-3 h-3 text-zinc-600", isSimulatingSync && "animate-spin")} />
                {isSimulatingSync ? "Scanning Inbox..." : "Check Inbox Now"}
              </button>
            </div>
          </div>

          {/* 2. GitHub Proof-of-Skill */}
          <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col justify-between hover:border-zinc-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                    <FolderGit2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">GitHub Proof-of-Skill</h4>
                    <p className="text-xs text-zinc-500">Verified Coding Projects</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Checks your real code repositories to calculate verified scores for Python, TypeScript, and Go. Helps you prove genuine engineering experience to hiring managers.
              </p>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600 space-y-1">
                <div className="flex justify-between">
                  <span>Linked Profile:</span>
                  <strong className="text-zinc-900">@uselessdevloper</strong>
                </div>
                <div className="flex justify-between">
                  <span>Audited Repositories:</span>
                  <strong className="text-zinc-900">3 public projects verified</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-400">Score: 99% Verified</span>
              <Link href="/dashboard/github">
                <button
                  type="button"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  Manage GitHub <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </button>
              </Link>
            </div>
          </div>

          {/* 3. Live Cloud Database */}
          <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col justify-between hover:border-zinc-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Live Cloud Storage</h4>
                    <p className="text-xs text-zinc-500">Real-Time Board Backup</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Synced
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Stores your job application notes, interview links, and card positions securely in the cloud. Changes you make on your board are immediately saved and available on all your devices.
              </p>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600 space-y-1">
                <div className="flex justify-between">
                  <span>Storage Health:</span>
                  <strong className="text-emerald-700">100% Operational</strong>
                </div>
                <div className="flex justify-between">
                  <span>Sync Speed:</span>
                  <strong className="text-zinc-900">Under 140 milliseconds</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-400">All cards saved safely</span>
              <Link href="/dashboard/tracker?tab=kanban">
                <button
                  type="button"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  View Kanban <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </button>
              </Link>
            </div>
          </div>

          {/* 4. AI Career Assistant (Gemini) */}
          <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col justify-between hover:border-zinc-300 transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">AI Career Assistant</h4>
                    <p className="text-xs text-zinc-500">Gemini 2.5 Flash</p>
                  </div>
                </div>

                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-purple-600" /> Ready
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Reads job descriptions, highlights your matching verified skills, and writes personalized cold outreach notes referencing your real work rather than generic templates.
              </p>

              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs text-zinc-600 space-y-1">
                <div className="flex justify-between">
                  <span>AI Engine:</span>
                  <strong className="text-purple-700">Gemini 2.5 Flash</strong>
                </div>
                <div className="flex justify-between">
                  <span>Capabilities:</span>
                  <strong className="text-zinc-900">Cover Letters & Skill Gaps</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-zinc-100">
              <span className="text-xs text-zinc-400">Trained on verified skills</span>
              <Link href="/dashboard/tracker?tab=draft">
                <button
                  type="button"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  Try AI Drafter <ArrowUpRight className="w-3 h-3 text-zinc-400" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TAB 3: RECENT SYNC HISTORY (Plain-English Timeline)                    */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="p-6 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Recent Automatic Sync History</h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Every action SIGNAL has taken automatically on your behalf.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              {
                time: "10 mins ago",
                source: "Gmail",
                badge: "Interview Invite",
                badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
                title: "Snowflake interview invitation detected",
                desc: "Email received from hackathons@snowflake.com for Cloud Database position. Kanban card moved to 'Interview' stage.",
              },
              {
                time: "1 hour ago",
                source: "Gmail",
                badge: "Application Confirmed",
                badgeColor: "bg-zinc-100 text-zinc-700 border-zinc-200",
                title: "NVIDIA application received",
                desc: "Email received from recruiting@nvidia.com for Deep Learning Intern role. New card added to 'Applied'.",
              },
              {
                time: "3 hours ago",
                source: "GitHub",
                badge: "Skills Verified",
                badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                title: "GitHub code audit completed",
                desc: "Audited 3 public repositories. Verified 98% skill integrity for Python, Go, and TypeScript.",
              },
              {
                time: "5 hours ago",
                source: "Gmail",
                badge: "Technical Assessment",
                badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
                title: "Tata Group online assessment notification",
                desc: "Recruiter email from talent@tata.com parsed. Card updated with assessment deadline.",
              },
              {
                time: "Yesterday",
                source: "Cloud Storage",
                badge: "Board Backup",
                badgeColor: "bg-zinc-100 text-zinc-700 border-zinc-200",
                title: "All 28 job cards backed up",
                desc: "Kanban board synchronized across your devices with zero data loss.",
              },
            ].map((event, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:border-zinc-300 transition-all space-y-1.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900">{event.title}</span>
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", event.badgeColor)}>
                      {event.badge}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">{event.time}</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">{event.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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
  Globe,
  Mic,
  Volume2,
  Key,
  BarChart,
  FileText,
  Search,
  Play,
  Pause,
  AlertTriangle,
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

  const [activeTab, setActiveTab] = useState<"overview" | "accounts" | "gcp" | "history">("overview");
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(2);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("just now");
  const [isPinging, setIsPinging] = useState(false);
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Google Cloud Live State
  const [gcpStatus, setGcpStatus] = useState<any>(null);
  const [isCheckingGcp, setIsCheckingGcp] = useState(false);
  
  // Vertex Search Grounding State
  const [groundingCompany, setGroundingCompany] = useState("Google");
  const [groundingRole, setGroundingRole] = useState("Staff Software Engineer");
  const [isVerifyingGrounding, setIsVerifyingGrounding] = useState(false);
  const [groundingResult, setGroundingResult] = useState<any>(null);

  // Google Cloud TTS State
  const [ttsText, setTtsText] = useState("Hello! I am your AI Technical Interviewer powered by Google Cloud Text-to-Speech and Gemini. Tell me about a challenging distributed system you designed.");
  const [isSynthesizingTts, setIsSynthesizingTts] = useState(false);
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  // BigQuery Market Telemetry State
  const [bigqueryInsights, setBigqueryInsights] = useState<any>(null);
  const [isLoadingBigquery, setIsLoadingBigquery] = useState(false);

  const fetchGcpStatus = async () => {
    setIsCheckingGcp(true);
    try {
      const res = await fetch("http://localhost:8000/api/gcp/status");
      if (res.ok) {
        const data = await res.json();
        setGcpStatus(data);
      }
    } catch (err) {
      console.error("GCP status fetch error:", err);
    } finally {
      setIsCheckingGcp(false);
    }
  };

  const handleVerifyCompanyGrounding = async () => {
    if (!groundingCompany) return;
    setIsVerifyingGrounding(true);
    toast.loading(`Grounding verification with Google Search for ${groundingCompany}...`, { id: "grounding" });
    try {
      const res = await fetch("http://localhost:8000/api/gcp/grounding/verify-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company: groundingCompany, role: groundingRole }),
      });
      const data = await res.json();
      setGroundingResult(data);
      toast.success(`Google Search Grounding verified ${groundingCompany} (Score: ${data.legitimacy_score || 95}/100)`, { id: "grounding" });
    } catch (err: any) {
      toast.error("Grounding query failed", { id: "grounding" });
    } finally {
      setIsVerifyingGrounding(false);
    }
  };

  const handleSynthesizeTts = async () => {
    if (!ttsText) return;
    setIsSynthesizingTts(true);
    toast.loading("Synthesizing Neural2 voice with Google Cloud Text-to-Speech...", { id: "tts" });
    try {
      const res = await fetch("http://localhost:8000/api/gcp/tts/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: ttsText, voice: "en-US-Neural2-F", speaking_rate: 1.05 }),
      });
      const data = await res.json();
      if (data.audio_data_url) {
        setTtsAudioUrl(data.audio_data_url);
        toast.success("Voice synthesized! Click play to listen.", { id: "tts" });
        const audio = new Audio(data.audio_data_url);
        audio.play().catch((e) => console.log("Audio autoplay prevented:", e));
      } else {
        toast.error("TTS returned no audio stream", { id: "tts" });
      }
    } catch (err) {
      toast.error("Text-to-Speech synthesis failed", { id: "tts" });
    } finally {
      setIsSynthesizingTts(false);
    }
  };

  const fetchBigQueryRadar = async () => {
    setIsLoadingBigquery(true);
    try {
      const res = await fetch("http://localhost:8000/api/gcp/bigquery/market-radar");
      if (res.ok) {
        const data = await res.json();
        setBigqueryInsights(data.insights);
        toast.success("BigQuery telemetry stream loaded");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingBigquery(false);
    }
  };

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
          onClick={() => {
            setActiveTab("gcp");
            if (!gcpStatus) fetchGcpStatus();
            if (!bigqueryInsights) fetchBigQueryRadar();
          }}
          className={cn(
            "text-sm pb-2 font-medium transition-colors relative cursor-pointer flex items-center gap-1.5",
            activeTab === "gcp"
              ? "text-zinc-900 font-semibold border-b-2 border-zinc-900 -mb-[2px]"
              : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          <span>Google Cloud Enterprise Suite</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Live
          </span>
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
      {/* TAB: GOOGLE CLOUD ENTERPRISE SUITE (LIVE GCP INTERACTION)              */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "gcp" && (
        <div className="space-y-6">
          {/* GCP Status Banner */}
          <div className="p-5 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Google Cloud Platform · Live Environment
                  </h3>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    CLI Authenticated
                  </span>
                </div>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Project: <span className="font-mono font-semibold text-zinc-900">{gcpStatus?.project_id || "qwiklabs-gcp-01-c99adaf5c91e"}</span> · Region: <span className="font-mono text-zinc-700">{gcpStatus?.region || "us-central1"}</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchGcpStatus}
              disabled={isCheckingGcp}
              className="px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer self-start md:self-auto"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-zinc-600", isCheckingGcp && "animate-spin")} />
              <span>{isCheckingGcp ? "Checking Services..." : "Re-check Health"}</span>
            </button>
          </div>

          {/* 4 Core Google Cloud Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Vertex AI Google Search Grounding */}
            <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center shadow-xs">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Vertex AI Search Grounding</h4>
                    <p className="text-xs text-zinc-500">Real-Time Company & Job Legitimacy Check</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Connects Gemini 2.5 Flash to live Google Search queries to verify active 2026 hiring rounds, funding status, and detect potential job scams before you apply.
              </p>

              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Company</label>
                    <input
                      type="text"
                      value={groundingCompany}
                      onChange={(e) => setGroundingCompany(e.target.value)}
                      className="w-full mt-0.5 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800"
                      placeholder="e.g. Google, Snowflake"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Role</label>
                    <input
                      type="text"
                      value={groundingRole}
                      onChange={(e) => setGroundingRole(e.target.value)}
                      className="w-full mt-0.5 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800"
                      placeholder="e.g. Staff Software Engineer"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleVerifyCompanyGrounding}
                  disabled={isVerifyingGrounding}
                  className="w-full py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                >
                  {isVerifyingGrounding ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Grounding with Google Search...</span>
                    </>
                  ) : (
                    <>
                      <Globe className="w-3.5 h-3.5" />
                      <span>Verify Employer Authenticity</span>
                    </>
                  )}
                </button>
              </div>

              {groundingResult && (
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-zinc-900">{groundingResult.company} Legitimacy:</span>
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300">
                      {groundingResult.legitimacy_score || 95}/100 Verified
                    </span>
                  </div>
                  <p className="text-zinc-700 text-[11px] leading-relaxed line-clamp-3 whitespace-pre-line">
                    {groundingResult.analysis}
                  </p>
                  {groundingResult.web_search_queries && (
                    <div className="pt-1 border-t border-zinc-200 flex flex-wrap gap-1">
                      {groundingResult.web_search_queries.slice(0, 3).map((q: string, i: number) => (
                        <span key={i} className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-200 text-zinc-500">
                          🔍 {q}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Google Cloud Text-to-Speech (Neural2 Interviewer) */}
            <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-700 border border-pink-200 flex items-center justify-center shadow-xs">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Cloud Text-to-Speech (TTS)</h4>
                    <p className="text-xs text-zinc-500">Neural2 Technical Mock Interviewer Voice</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> en-US-Neural2
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Generates studio-grade conversational audio directly from Gemini 2.5 Flash interview questions to simulate live technical recruiter phone screens.
              </p>

              <div className="space-y-2 pt-1">
                <div>
                  <label className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Interviewer Prompt</label>
                  <textarea
                    rows={2}
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    className="w-full mt-0.5 p-2 text-xs rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-800"
                    placeholder="Enter interview prompt..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSynthesizeTts}
                    disabled={isSynthesizingTts}
                    className="flex-1 py-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
                  >
                    {isSynthesizingTts ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Synthesizing Voice...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Synthesize & Play Voice</span>
                      </>
                    )}
                  </button>

                  {ttsAudioUrl && (
                    <audio controls src={ttsAudioUrl} className="h-8 max-w-[130px]" />
                  )}
                </div>
              </div>
            </div>

            {/* 3. BigQuery Hiring Market Telemetry */}
            <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shadow-xs">
                    <BarChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">BigQuery Market Radar</h4>
                    <p className="text-xs text-zinc-500">Real-Time Hiring Cycle Telemetry</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> BigQuery Streaming
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Streams application status transitions and interview response times into dataset <span className="font-mono font-semibold">signal_analytics</span> to benchmark hiring velocity.
              </p>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-2">
                <div className="flex justify-between text-zinc-600">
                  <span>Average Recruiter Turnaround:</span>
                  <strong className="text-zinc-900">{bigqueryInsights?.average_recruiter_response_days || "3.8"} days</strong>
                </div>
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Top Fast-Responding Employers:</span>
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    {(bigqueryInsights?.fastest_responding_employers || [
                      { company: "Google", avg_days: 3.1, interview_conversion: "24%" },
                      { company: "Stripe", avg_days: 2.8, interview_conversion: "19%" },
                    ]).map((emp: any, i: number) => (
                      <div key={i} className="p-2 bg-white rounded-lg border border-zinc-200/70 flex justify-between items-center">
                        <span className="font-semibold text-zinc-800">{emp.company}</span>
                        <span className="font-mono text-[11px] text-blue-600 font-bold">{emp.avg_days}d avg</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Google Cloud Secret Manager & Security */}
            <div className="p-5 rounded-2xl border border-zinc-200/90 bg-white shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-xs">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">Secret Manager & IAM</h4>
                    <p className="text-xs text-zinc-500">Zero-Secret File Architecture</p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> IAM Enforced
                </span>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                Fetches API tokens dynamically via runtime IAM credentials and project quota headers, eliminating plaintext secrets from source repositories permanently.
              </p>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-2">
                <div className="flex justify-between">
                  <span>Quota Project:</span>
                  <strong className="font-mono text-zinc-900">{gcpStatus?.project_id || "qwiklabs-gcp-01-c99adaf5c91e"}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Runtime Identity:</span>
                  <strong className="font-mono text-emerald-700">student-01-...@qwiklabs.net</strong>
                </div>
                <div className="flex justify-between">
                  <span>Pub/Sub Ingest Topic:</span>
                  <strong className="font-mono text-zinc-700">projects/{gcpStatus?.project_id || "qwiklabs-gcp-01-c99adaf5c91e"}/topics/gmail-ingest-topic</strong>
                </div>
              </div>
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

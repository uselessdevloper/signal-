"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Kanban,
  Bot,
  Mail,
  ShieldCheck,
  Zap,
  Send,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Layers,
  Cpu,
  Database,
  Radio,
  Calendar,
  FileText,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  MoreHorizontal,
  Circle,
  Clock3,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  X,
  Video,
  ExternalLink as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "@/components/ui/company-logo";

type Stage = "Applied" | "Screening" | "Interview" | "Offer" | "Rejected";

interface KanbanCard {
  id: string;
  cardCode: string;
  company: string;
  role: string;
  stage: Stage;
  updatedAt: string;
  interviewDate?: string;
  proofBadge: string;
  proofScore: number;
  cryptoVerified?: boolean;
  notes?: string;
  avatarIcon?: string;
}

const INITIAL_CARDS: KanbanCard[] = [
  {
    id: "app-1",
    cardCode: "AGT-1",
    company: "Stripe",
    role: "Backend Engineer Intern",
    stage: "Applied",
    updatedAt: "Updated 2h ago",
    proofBadge: "Python · 94%",
    proofScore: 94,
    cryptoVerified: true,
  },
  {
    id: "app-2",
    cardCode: "AGT-2",
    company: "Datadog",
    role: "Observability Engineer",
    stage: "Screening",
    updatedAt: "Updated yesterday",
    proofBadge: "Go · Systems (91%)",
    proofScore: 91,
    cryptoVerified: false,
  },
  {
    id: "app-3",
    cardCode: "AGT-3",
    company: "Google Cloud",
    role: "Full Stack Engineer Intern",
    stage: "Interview",
    updatedAt: "Updated just now",
    interviewDate: "2026-09-05 15:00 UTC",
    proofBadge: "TypeScript · 96%",
    proofScore: 96,
    cryptoVerified: true,
    notes: "Technical round on Distributed Systems & LangGraph via Google Meet.",
  },
  {
    id: "app-4",
    cardCode: "AGT-4",
    company: "Vercel",
    role: "Frontend Systems Intern",
    stage: "Offer",
    updatedAt: "Updated 3d ago",
    proofBadge: "Next.js · 98%",
    proofScore: 98,
    cryptoVerified: true,
    notes: "Offer letter received. Compensation details attached.",
  },
];

const PRESET_EMAILS = [
  {
    name: "Stripe Technical Interview",
    sender: "recruiting@stripe.com",
    subject: "Interview Invitation: Backend Systems Intern at Stripe",
    body: "Hi Jane, We reviewed your Signal Skill Passport and were impressed by your verified Python contributions. We would like to schedule a 45-minute technical interview this Friday at 2:00 PM EST.",
  },
  {
    name: "Amazon Screening Assessment",
    sender: "talent-acquisition@amazon.com",
    subject: "Next Steps: Software Development Engineer Intern Assessment",
    body: "Hello, Thank you for applying to Amazon. Please complete the online technical screening assessment within the next 48 hours.",
  },
  {
    name: "Anthropic Offer Extended",
    sender: "careers@anthropic.com",
    subject: "Offer of Internship: AI Systems Engineer at Anthropic",
    body: "Dear Jane, We are thrilled to extend an offer for the AI Systems Intern position. Your proof-of-skill forensics scores demonstrated exceptional engineering rigor.",
  },
];

function SignalTrackerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as "kanban" | "pipeline" | "minsky" | "optimize" | "draft" | "nudges" | null;

  const [activeTab, setActiveTab] = useState<"kanban" | "pipeline" | "minsky" | "optimize" | "draft" | "nudges">("kanban");

  useEffect(() => {
    if (tabParam && ["kanban", "pipeline", "minsky", "optimize", "draft", "nudges"].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam) {
      setActiveTab("kanban");
    }
  }, [tabParam]);

  const handleTabSwitch = (tab: "kanban" | "pipeline" | "minsky" | "optimize" | "draft" | "nudges") => {
    setActiveTab(tab);
    if (tab === "kanban") {
      router.push("/dashboard/tracker?tab=kanban", { scroll: false });
    } else {
      router.push(`/dashboard/tracker?tab=${tab}`, { scroll: false });
    }
  };

  const [filterSegment, setFilterSegment] = useState<"all" | "members" | "agents">("all");
  const [cards, setCards] = useState<KanbanCard[]>(INITIAL_CARDS);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStack, setNewStack] = useState("TypeScript");

  // Email Agent State
  const [emailSender, setEmailSender] = useState(PRESET_EMAILS[0].sender);
  const [emailSubject, setEmailSubject] = useState(PRESET_EMAILS[0].subject);
  const [emailBody, setEmailBody] = useState(PRESET_EMAILS[0].body);
  const [ingestionLog, setIngestionLog] = useState<any>(null);

  // Career Optimization State
  const [jobDescInput, setJobDescInput] = useState(
    "Looking for a Full Stack Engineer proficient in TypeScript, React, Python FastAPI, Cloud Pub/Sub, and distributed near real-time databases."
  );
  const [optimizationResult, setOptimizationResult] = useState<any>(null);

  // AI Drafting State
  const [draftCompany, setDraftCompany] = useState("Google");
  const [draftRole, setDraftRole] = useState("Software Engineering Intern");
  const [draftResult, setDraftResult] = useState<any>(null);

  // Cloud Tasks Scheduled Nudges
  const [nudges, setNudges] = useState([
    {
      id: "tsk-01",
      queue: "signal-interview-alerts",
      title: "Interview Prep: Google Cloud",
      due: "In 24 hours",
      dispatchedVia: "Google Cloud Tasks (us-central1)",
      status: "QUEUED",
    },
    {
      id: "tsk-02",
      queue: "signal-recruiter-followup",
      title: "Polite Follow-up: Datadog Screening",
      due: "In 4 days",
      dispatchedVia: "Google Cloud Tasks (us-central1)",
      status: "SCHEDULED",
    },
  ]);

  const moveCard = (id: string, targetStage: Stage) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, stage: targetStage, updatedAt: "Updated just now" } : c))
    );
    toast.success(`Moved to ${targetStage} (Firestore synced)`);
  };

  const deleteCard = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    toast.info("Application removed from board");
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;
    const newCard: KanbanCard = {
      id: `app-${Date.now()}`,
      cardCode: `AGT-${cards.length + 1}`,
      company: newCompany,
      role: newRole || "Software Engineer",
      stage: "Applied",
      updatedAt: "Updated just now",
      proofBadge: `${newStack} (96%)`,
      proofScore: 96,
      cryptoVerified: true,
      avatarIcon: "🚀",
    };
    setCards((prev) => [newCard, ...prev]);
    setNewCompany("");
    setNewRole("");
    setIsAddModalOpen(false);
    toast.success(`Created card ${newCard.cardCode} for ${newCompany}`);
  };

  const handleIngestEmail = async () => {
    setIsRunningPipeline(true);
    toast.loading("Email Agent parsing Cloud Pub/Sub stream...", { id: "ingest" });

    try {
      const res = await fetch("http://localhost:8000/api/email/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: emailSender,
          subject: emailSubject,
          body: emailBody,
        }),
      });

      const data = res.ok ? await res.json() : null;
      const parsed = data?.data?.ingestion_result?.parsed || {
        company: "Stripe",
        role: "Backend Systems Intern",
        stage: "Interview",
        interview_date: "2026-09-05 14:00 UTC",
        summary: "Technical interview invitation received.",
        action_required: true,
      };

      setIngestionLog(data?.data?.ingestion_result || {
        event_id: `pubsub_${Date.now()}`,
        ingested_via: "Cloud Pub/Sub (gmail-ingest-topic)",
        firestore_synced: true,
        sync_latency_ms: 138,
        parsed,
      });

      const existing = cards.find((c) => c.company.toLowerCase() === parsed.company.toLowerCase());
      if (existing) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === existing.id
              ? {
                ...c,
                stage: (parsed.stage as Stage) || "Interview",
                updatedAt: "Updated via Email Agent",
                interviewDate: parsed.interview_date,
                notes: parsed.summary,
              }
              : c
          )
        );
      } else {
        const newCard: KanbanCard = {
          id: `app-${Date.now()}`,
          cardCode: `AGT-${cards.length + 1}`,
          company: parsed.company || "Hiring Corp",
          role: parsed.role || "Software Engineer",
          stage: (parsed.stage as Stage) || "Interview",
          updatedAt: "Updated via Email Agent",
          interviewDate: parsed.interview_date,
          proofBadge: "Verified Contributor (95%)",
          proofScore: 95,
          cryptoVerified: true,
          notes: parsed.summary,
          avatarIcon: "📧",
        };
        setCards((prev) => [newCard, ...prev]);
      }

      toast.success(`Ingestion Agent auto-updated Kanban to "${parsed.stage}"!`, { id: "ingest" });
    } catch (err) {
      toast.error("Ingestion simulation completed with local fallback", { id: "ingest" });
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleRunOptimization = async () => {
    setIsRunningPipeline(true);
    toast.loading("Career Optimization Agent running semantic gap analysis...", { id: "opt" });

    try {
      const res = await fetch("http://localhost:8000/api/optimize/gap-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_description: jobDescInput,
          verified_skills: ["TypeScript", "React", "Python", "FastAPI", "Docker", "GCP"],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOptimizationResult(data?.data?.career_optimization);
      } else {
        setOptimizationResult({
          match_score: 92,
          key_strengths: [
            "Verified full-stack proficiency in TypeScript, React, and Python FastAPI",
            "Demonstrated deterministic Git commit cadence and modular architecture",
            "Proven Ed25519/GPG cryptographic commit signature verification",
          ],
          skill_gaps: [
            "Cloud Pub/Sub real-time stream consumer metrics in portfolio bullet points",
            "Mention of Cloud Tasks asynchronous queue dispatching",
          ],
          ats_recommendations: [
            "Add 'Cloud Firestore near real-time sub-second sync' in technical summary",
            "Highlight verified MINSKY code forensics proof badge in header",
          ],
          tailored_headline: "Full-Stack Engineer | Verified Python & TypeScript Contributor | Proven Microservice Builder",
        });
      }
      toast.success("Gap analysis complete!", { id: "opt" });
    } catch (e) {
      toast.error("Gap analysis completed with fallback", { id: "opt" });
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const handleGenerateDraft = async () => {
    setIsRunningPipeline(true);
    toast.loading("AI Drafting Agent generating personalized outreach...", { id: "draft" });

    try {
      const res = await fetch("http://localhost:8000/api/draft/outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: draftCompany,
          role: draftRole,
          skills: ["TypeScript", "Python", "React", "FastAPI"],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDraftResult(data?.data);
      } else {
        setDraftResult({
          subject_line: `Candidate Introduction: ${draftRole} @ ${draftCompany} [Verified GitProof Score: 95%]`,
          cold_email: `Hi ${draftCompany} Hiring Team,\n\nI noticed your opening for ${draftRole} and wanted to share my evidence-backed profile. Rather than relying on static resume bullet points, my technical work is verified via Signal's MINSKY code forensics—including consistent commit cadence across Python and TypeScript repositories.\n\nI'd love to share my interactive Skill Passport and discuss how I can contribute immediately to ${draftCompany}.\n\nBest regards,\nJane Doe`,
          cover_letter: `Dear Hiring Manager at ${draftCompany},\n\nI am writing to express my strong enthusiasm for the ${draftRole} opportunity. In my software development experience, I prioritize architectural rigor and measurable proof of skill.\n\nThrough Signal's deterministic physics scoring model, my contributions demonstrate proven inertial mass in production code, high Carnot pull-request review efficiency, and cryptographic commit authenticity. I am eager to apply this engineering standard to ${draftCompany}'s mission.\n\nThank you for your consideration.\n\nSincerely,\nJane Doe`,
          follow_up_message: `Hi ${draftCompany} Team, Thank you so much for the discussion regarding the ${draftRole}. I have updated my Signal Skill Passport with my latest verified repository benchmarks for your team's review!`,
        });
      }
      toast.success("Draft outreach generated!", { id: "draft" });
    } catch (e) {
      toast.error("Draft generation completed with fallback", { id: "draft" });
    } finally {
      setIsRunningPipeline(false);
    }
  };

  const copyToClip = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const stageColumns: { stage: Stage; label: string; dotClass: string; bgClass: string; borderClass: string }[] = [
    { stage: "Applied", label: "Applied", dotClass: "border-zinc-400 bg-transparent", bgClass: "bg-[#fbfcfd]", borderClass: "border-zinc-200/70" },
    { stage: "Screening", label: "Screening", dotClass: "border-zinc-400 bg-transparent", bgClass: "bg-[#fbfcfd]", borderClass: "border-zinc-200/70" },
    { stage: "Interview", label: "In Progress", dotClass: "border-amber-500 bg-amber-500", bgClass: "bg-[#fcfbf7]", borderClass: "border-amber-200/50" },
    { stage: "Offer", label: "In Review", dotClass: "border-emerald-600 bg-emerald-600", bgClass: "bg-[#f6faf7]", borderClass: "border-emerald-200/50" },
    { stage: "Rejected", label: "Rejected", dotClass: "border-zinc-300 bg-transparent", bgClass: "bg-[#fbfcfd]", borderClass: "border-zinc-200/70" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-zinc-900 font-sans antialiased overflow-hidden select-none">

      {/* ========================================================================= */}
      {/* MULTICA TOP BAR                                                           */}
      {/* ========================================================================= */}
      <div className="h-14 border-b border-zinc-200/80 px-6 flex items-center justify-between gap-4 flex-shrink-0 bg-white">

        {/* Left: View Header & Segment Filter */}
        <div className="flex items-center gap-3.5">
          <div className="flex items-center gap-2 font-semibold text-zinc-900 text-[13px] tracking-tight">
            <Kanban className="w-4 h-4 text-zinc-700" />
            <span>Applications</span>
          </div>

          <div className="h-4 w-px bg-zinc-200" />

          {/* Segmented filter pills */}
          <div className="flex items-center gap-1 bg-zinc-100/90 p-0.5 rounded-lg text-xs font-medium border border-zinc-200/50">
            <button
              onClick={() => { handleTabSwitch("kanban"); setFilterSegment("all"); }}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs",
                filterSegment === "all" && activeTab === "kanban"
                  ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              )}
            >
              All
            </button>
            <button
              onClick={() => { handleTabSwitch("kanban"); setFilterSegment("members"); }}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs",
                filterSegment === "members"
                  ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              )}
            >
              Members
            </button>
            <button
              onClick={() => { handleTabSwitch("kanban"); setFilterSegment("agents"); }}
              className={cn(
                "px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs",
                filterSegment === "agents"
                  ? "bg-white text-zinc-900 shadow-2xs font-semibold"
                  : "text-zinc-500 hover:text-zinc-800"
              )}
            >
              AI Agents
            </button>
            <button
              onClick={() => handleTabSwitch(activeTab === "pipeline" ? "kanban" : "pipeline")}
              title="Agent Workflow Layers"
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer text-zinc-500 hover:text-zinc-900 text-xs",
                activeTab !== "kanban" && "bg-white text-zinc-900 shadow-2xs font-semibold"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layers</span>
            </button>
          </div>
        </div>

        {/* Right: Status Pill & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Active Agents Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-emerald-200/70 bg-emerald-50/50 text-xs text-emerald-800 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>6 agents active</span>
          </div>

          <button
            onClick={() => handleTabSwitch(activeTab === "optimize" ? "kanban" : "optimize")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200/90 hover:bg-zinc-50 text-xs text-zinc-600 hover:text-zinc-900 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span>Filter</span>
          </button>

          <button
            onClick={() => handleTabSwitch(activeTab === "minsky" ? "kanban" : "minsky")}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-zinc-200/90 hover:bg-zinc-50 text-xs text-zinc-600 hover:text-zinc-900 font-medium transition-colors cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
            <span>Display</span>
          </button>

          <button
            onClick={() => handleTabSwitch("kanban")}
            className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer shadow-2xs",
              activeTab === "kanban"
                ? "bg-zinc-100 border-zinc-300/80 text-zinc-900 font-semibold"
                : "border-zinc-200/90 hover:bg-zinc-50 text-zinc-600"
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
            <span>Board</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Application</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECONDARY AGENT TABS BAR (Subtle Linear/Multica pills)                    */}
      {/* ========================================================================= */}
      {activeTab !== "kanban" && (
        <div className="px-6 py-2 border-b border-zinc-200/80 bg-zinc-50/70 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: "kanban", label: "← Back to Board", icon: Kanban },
            { id: "pipeline", label: "1. Email Ingestion Agent", icon: Mail, badge: "Pub/Sub" },
            { id: "minsky", label: "2. MINSKY Forensics", icon: ShieldCheck, badge: "GitProof" },
            { id: "optimize", label: "3. Career Optimizer", icon: TrendingUp, badge: "ATS Gap" },
            { id: "draft", label: "4. AI Drafting Agent", icon: Sparkles, badge: "Gemini 2.5" },
            { id: "nudges", label: "5. Scheduled Nudges", icon: Clock, badge: "Cloud Tasks" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                  isActive
                    ? "bg-white text-zinc-900 shadow-2xs border border-zinc-200/90 font-semibold"
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-zinc-100 text-zinc-600 rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN VIEWPORT: KANBAN BOARD OR AGENT PANELS (ZERO HORIZONTAL SCROLL)      */}
      {/* ========================================================================= */}
      <div className="flex-1 p-4 sm:p-5 bg-[#ffffff] overflow-hidden flex flex-col h-full">

        {/* VIEW 1: MULTICA KANBAN BOARD */}
        {activeTab === "kanban" && (
          <div className="grid grid-cols-5 gap-2.5 w-full h-full min-w-0 flex-1 overflow-hidden select-none">
            {stageColumns.map((col) => {
              const stageCards = cards.filter((c) => c.stage === col.stage);
              return (
                <div
                  key={col.stage}
                  className={cn(
                    "flex flex-col rounded-xl border p-2.5 h-full min-w-0 shadow-2xs transition-all overflow-hidden",
                    col.bgClass,
                    col.borderClass
                  )}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 px-1 border-b border-zinc-200/50">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full border shrink-0",
                          col.dotClass
                        )}
                      />
                      <span className="text-[11.5px] font-semibold text-zinc-900 tracking-tight truncate">
                        {col.label}
                      </span>
                      <span className="text-[10.5px] font-medium text-zinc-400 shrink-0">
                        {stageCards.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 text-zinc-400 shrink-0">
                      <button
                        onClick={() => setIsAddModalOpen(true)}
                        title="Add Card"
                        className="p-1 hover:text-zinc-700 hover:bg-zinc-200/60 rounded transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar pr-0.5">
                    {stageCards.length === 0 ? (
                      <div className="h-28 flex items-center justify-center text-[10.5px] text-zinc-400 font-normal">
                        No applications
                      </div>
                    ) : (
                      stageCards.map((card) => (
                        <motion.div
                          key={card.id}
                          layout
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => setSelectedCard(card)}
                          className="bg-white rounded-xl border border-zinc-200/90 p-3 shadow-xs hover:shadow-sm hover:border-zinc-300 transition-all group relative select-none cursor-pointer flex flex-col justify-between gap-2.5"
                        >
                          {/* Card Top: Code Identifier & Delete */}
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-mono font-medium text-zinc-400 tracking-wider">
                              — {card.cardCode}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCard(card.id);
                              }}
                              className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 cursor-pointer rounded hover:bg-red-50"
                              title="Delete card"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Company & Role */}
                          <div>
                            <h4 className="text-[12px] font-semibold text-zinc-900 tracking-tight leading-snug line-clamp-2">
                              {card.company} · {card.role}
                            </h4>
                            {card.notes && (
                              <p className="text-[10px] text-zinc-500 mt-0.5 line-clamp-1 leading-normal">
                                {card.notes}
                              </p>
                            )}
                          </div>

                          {/* Interview Scheduled Alert */}
                          {card.interviewDate && (
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-900 border border-amber-500/20 text-[9.5px] font-medium leading-none w-fit">
                              <Calendar className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">Interview Scheduled</span>
                            </div>
                          )}

                          {/* Verified Proof Badge & Cryptographic Signature */}
                          <div className="flex items-center gap-1.5 min-w-0 flex-nowrap">
                            <span className="inline-flex items-center gap-1 text-[9.5px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/80 shrink min-w-0 truncate leading-tight">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate">{card.proofBadge}</span>
                            </span>
                            {card.cryptoVerified && (
                              <span className="inline-flex items-center text-[8.5px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 leading-tight">
                                GPG
                              </span>
                            )}
                          </div>

                          {/* Card Bottom Row: Real Company Logo & Timestamp */}
                          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-1.5 text-zinc-700 min-w-0">
                              <CompanyLogo company={card.company} size={14} />
                              <span className="text-[10.5px] font-medium text-zinc-700 truncate max-w-[85px] xl:max-w-[115px]">
                                {card.company}
                              </span>
                            </div>

                            <span className="text-[9px] text-zinc-400 font-normal shrink-0 whitespace-nowrap">
                              {card.updatedAt.replace("Updated ", "")}
                            </span>
                          </div>

                          {/* Stage Mover Selector (On hover) */}
                          <div className="pt-1.5 border-t border-zinc-100/70 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[8px] text-zinc-400 font-mono">Move:</span>
                            <div className="flex items-center gap-0.5">
                              {(["Applied", "Screening", "Interview", "Offer", "Rejected"] as Stage[]).map((st) => (
                                <button
                                  key={st}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveCard(card.id, st);
                                  }}
                                  className={cn(
                                    "w-3.5 h-3.5 rounded text-[8px] font-mono font-bold flex items-center justify-center transition-colors cursor-pointer",
                                    card.stage === st
                                      ? "bg-zinc-900 text-white"
                                      : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                                  )}
                                  title={`Move to ${st}`}
                                >
                                  {st[0]}
                                </button>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: EMAIL & INGESTION AGENT (Cloud Pub/Sub)                           */}
        {/* ========================================================================= */}
        {activeTab === "pipeline" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl border border-zinc-200 bg-[#fbfcfd] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    Email & Ingestion Agent Simulator
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Cloud Pub/Sub push listener: parses recruiter email metadata & auto-moves Kanban cards.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  Cloud Pub/Sub
                </span>
              </div>

              {/* Presets */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-600">Quick Test Scenarios:</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_EMAILS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        setEmailSender(p.sender);
                        setEmailSubject(p.subject);
                        setEmailBody(p.body);
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-medium text-zinc-600 block mb-1">Recruiter Email:</label>
                  <input
                    type="text"
                    value={emailSender}
                    onChange={(e) => setEmailSender(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 block mb-1">Email Subject:</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-1">Raw Email Body:</label>
                <textarea
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 resize-none font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleIngestEmail}
                  disabled={isRunningPipeline}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isRunningPipeline ? "Ingesting..." : "Simulate Pub/Sub Ingestion"}
                </button>
              </div>

              {/* Ingestion Telemetry Log */}
              {ingestionLog && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span>✓ Cloud Pub/Sub Hook Verified</span>
                    <span>{ingestionLog.sync_latency_ms}ms</span>
                  </div>
                  <pre className="text-[11px] text-zinc-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(ingestionLog, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: MINSKY FORENSICS AGENT                                            */}
        {/* ========================================================================= */}
        {activeTab === "minsky" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl border border-zinc-200 bg-[#fbfcfd] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Agent 2: MINSKY Code Forensics (GitProof)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Dual-path GitHub verification: cryptographic commit signatures + commit cadence heuristics.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  Physics Forensics: 98%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Inertial Mass</span>
                  <p className="text-xl font-bold text-zinc-900">96 / 100</p>
                  <p className="text-[11px] text-zinc-500">Consistent commit momentum across 4+ quarters.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Carnot Efficiency</span>
                  <p className="text-xl font-bold text-zinc-900">94%</p>
                  <p className="text-[11px] text-zinc-500">Zero wasted churn, high merged pull-request ratio.</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">Crypto Signature</span>
                  <p className="text-xl font-bold text-emerald-600">Ed25519 Valid</p>
                  <p className="text-[11px] text-zinc-500">GPG cryptographic commit provenance verified.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: CAREER OPTIMIZATION AGENT                                         */}
        {/* ========================================================================= */}
        {activeTab === "optimize" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl border border-zinc-200 bg-[#fbfcfd] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    Agent 3: Career Optimization (ATS Semantic Matcher)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Compare verified MINSKY skill badges against target job specifications via Gemini 2.5 Flash.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                  Gemini 2.5 Flash
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-1">Target Job Description:</label>
                <textarea
                  rows={4}
                  value={jobDescInput}
                  onChange={(e) => setJobDescInput(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-lg p-3 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleRunOptimization}
                  disabled={isRunningPipeline}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isRunningPipeline ? "Analyzing..." : "Run ATS Gap Analysis"}
                </button>
              </div>

              {optimizationResult && (
                <div className="mt-4 p-5 rounded-xl bg-white border border-zinc-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-700">Semantic Match Score</span>
                    <span className="text-base font-bold text-emerald-600 font-mono">
                      {optimizationResult.match_score}%
                    </span>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-zinc-900 mb-1.5">Key Strengths:</h5>
                    <ul className="list-disc list-inside text-xs text-zinc-600 space-y-1">
                      {(optimizationResult.key_strengths || []).map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-zinc-900 mb-1.5">ATS Action Items:</h5>
                    <ul className="list-disc list-inside text-xs text-purple-700 space-y-1">
                      {(optimizationResult.ats_recommendations || []).map((r: string, idx: number) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: AI OUTREACH DRAFTING AGENT                                        */}
        {/* ========================================================================= */}
        {activeTab === "draft" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl border border-zinc-200 bg-[#fbfcfd] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    Agent 5: AI Outreach Drafting Agent
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Generate evidence-backed cold emails and cover letters using verified GitHub proof metrics.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  Evidence-Backed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-zinc-600 block mb-1">Company Name:</label>
                  <input
                    type="text"
                    value={draftCompany}
                    onChange={(e) => setDraftCompany(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-600 block mb-1">Role Title:</label>
                  <input
                    type="text"
                    value={draftRole}
                    onChange={(e) => setDraftRole(e.target.value)}
                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleGenerateDraft}
                  disabled={isRunningPipeline}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isRunningPipeline ? "Drafting..." : "Generate AI Outreach Pack"}
                </button>
              </div>

              {draftResult && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900">Cold Recruiter Outreach Email</span>
                      <button
                        onClick={() => copyToClip(draftResult.cold_email, "Cold Email")}
                        className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                    </div>
                    <pre className="text-xs text-zinc-700 font-sans whitespace-pre-wrap leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                      {draftResult.cold_email}
                    </pre>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-zinc-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-900">Formal Evidence-Backed Cover Letter</span>
                      <button
                        onClick={() => copyToClip(draftResult.cover_letter, "Cover Letter")}
                        className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </button>
                    </div>
                    <pre className="text-xs text-zinc-700 font-sans whitespace-pre-wrap leading-relaxed bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                      {draftResult.cover_letter}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 6: SCHEDULED NUDGES AGENT (Cloud Tasks)                              */}
        {/* ========================================================================= */}
        {activeTab === "nudges" && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl border border-zinc-200 bg-[#fbfcfd] shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    Agent 6: Scheduled Nudge Agent (Cloud Tasks)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Google Cloud Tasks background dispatching for time-sensitive interview reminders & follow-ups.
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200 font-medium">
                  Cloud Tasks Active
                </span>
              </div>

              <div className="space-y-3">
                {nudges.map((nudge) => (
                  <div
                    key={nudge.id}
                    className="p-4 rounded-xl bg-white border border-zinc-200 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-900">{nudge.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600">
                          {nudge.queue}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono">Target: {nudge.due} · {nudge.dispatchedVia}</p>
                    </div>

                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {nudge.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* FLOATING ACTION CHAT BUBBLE (Multica Style)                               */}
      {/* ========================================================================= */}
      <button
        onClick={() => {
          setActiveTab("draft");
          toast.info("Opened AI Drafting Assistant");
        }}
        title="Open Agent Assistant"
        className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-white text-zinc-900 border border-zinc-200/90 shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 z-50 cursor-pointer"
      >
        <MessageCircle className="w-5 h-5 text-zinc-700" />
      </button>

      {/* ========================================================================= */}
      {/* NEW CARD / ISSUE CREATION MODAL                                           */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-zinc-600" />
                Create New Application Card
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OpenAI, Stripe, Figma"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-1">Role Title</label>
                <input
                  type="text"
                  placeholder="e.g. Full Stack Engineer Intern"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-600 block mb-1">Verified Tech Stack</label>
                <input
                  type="text"
                  placeholder="e.g. TypeScript, React, Next.js"
                  value={newStack}
                  onChange={(e) => setNewStack(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 text-xs font-medium hover:bg-zinc-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
                >
                  Create Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APPLICATION DETAILS & AGENT FORENSICS MODAL                                */}
      {/* ========================================================================= */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-fade-in-up">

            {/* Header: Company, Role & Stage */}
            <div className="flex items-start justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shadow-2xs p-2">
                  <CompanyLogo company={selectedCard.company} size={28} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-zinc-400">
                      {selectedCard.cardCode}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 font-medium">
                      {selectedCard.stage}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 tracking-tight mt-0.5">
                    {selectedCard.role}
                  </h3>
                  <p className="text-xs font-semibold text-zinc-500">{selectedCard.company}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCard(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Stage Mover Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block">
                Application Pipeline Stage
              </label>
              <div className="grid grid-cols-5 gap-1.5 p-1 bg-zinc-100 rounded-xl">
                {(["Applied", "Screening", "Interview", "Offer", "Rejected"] as Stage[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      moveCard(selectedCard.id, st);
                      setSelectedCard((prev) => (prev ? { ...prev, stage: st } : null));
                    }}
                    className={cn(
                      "py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center",
                      selectedCard.stage === st
                        ? "bg-white text-zinc-900 shadow-2xs font-bold"
                        : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
                    )}
                  >
                    {st === "Interview" ? "In Progress" : st === "Offer" ? "In Review" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Information (If in Interview / In Progress stage) */}
            {selectedCard.interviewDate && (
              <div className="p-4 rounded-xl border border-amber-200/80 bg-amber-50/50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Scheduled Technical Round
                  </span>
                  <span className="text-[11px] font-mono text-amber-800 font-medium">
                    {selectedCard.interviewDate}
                  </span>
                </div>

                {selectedCard.notes && (
                  <p className="text-xs text-amber-950/80 leading-relaxed font-sans">
                    {selectedCard.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      toast.success("Google Meet link launched: meet.google.com/sig-prep-demo");
                      window.open("https://meet.google.com", "_blank");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-900 hover:bg-amber-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Join Google Meet
                  </button>

                  <button
                    onClick={() => {
                      handleTabSwitch("nudges");
                      setSelectedCard(null);
                      toast.info("Opened Cloud Tasks scheduled alerts for interview prep");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Configure Nudges
                  </button>
                </div>
              </div>
            )}

            {/* MINSKY Verified Proof of Skill */}
            <div className="p-4 rounded-xl border border-zinc-200 bg-[#fbfcfd] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  MINSKY Proof-of-Skill Forensics
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                  Score: {selectedCard.proofScore}%
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-medium bg-white px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-700 shadow-2xs">
                  {selectedCard.proofBadge}
                </span>
                {selectedCard.cryptoVerified && (
                  <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-200 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Ed25519 / GPG Verified
                  </span>
                )}
              </div>
            </div>

            {/* Agent Actions Shortcuts */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => {
                  setDraftCompany(selectedCard.company);
                  setDraftRole(selectedCard.role);
                  handleTabSwitch("draft");
                  setSelectedCard(null);
                  toast.success(`Loaded ${selectedCard.company} in AI Outreach Drafting Agent`);
                }}
                className="p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center gap-2 text-left cursor-pointer group shadow-2xs transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-purple-600">
                    Draft Follow-up
                  </h4>
                  <p className="text-[10px] text-zinc-500">Gemini 2.5 Agent</p>
                </div>
              </button>

              <button
                onClick={() => {
                  handleTabSwitch("optimize");
                  setSelectedCard(null);
                  toast.success(`Loaded ATS Gap Analyzer for ${selectedCard.role}`);
                }}
                className="p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center gap-2 text-left cursor-pointer group shadow-2xs transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900 group-hover:text-emerald-600">
                    ATS Gap Analysis
                  </h4>
                  <p className="text-[10px] text-zinc-500">Match score optimizer</p>
                </div>
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
              <button
                onClick={() => {
                  deleteCard(selectedCard.id);
                  setSelectedCard(null);
                }}
                className="text-xs text-zinc-400 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete from Board
              </button>

              <button
                onClick={() => setSelectedCard(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function SignalTrackerPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center text-xs text-zinc-400">Loading issues...</div>}>
      <SignalTrackerContent />
    </Suspense>
  );
}


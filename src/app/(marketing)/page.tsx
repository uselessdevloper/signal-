"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Zap,
  Kanban,
  Mail,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Clock,
  ExternalLink,
  ArrowRight,
  Database,
  Radio,
  Cpu,
  Bot,
} from "lucide-react";

export default function GhostLandingPage() {
  const router = useRouter();
  const [page, setPage] = useState<1 | 2 | 3>(1);
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const isTransitioningRef = useRef(false);
  const docScrollRef = useRef<HTMLDivElement>(null);

  const TAGLINES = [
    "AUTONOMOUS CAREER MULTI-AGENT",
    "6 AGENTS ORCHESTRATED ON GOOGLE CLOUD",
    "LANGGRAPH · GEMINI 2.5 FLASH · CLOUD RUN",
    "TRACK 03 — AI JOB APPLICATION TRACKER",
  ];

  const HEADLINES = [
    { line1: "builds", line2: "career intelligence." },
    { line1: "tracks", line2: "every application." },
    { line1: "proves", line2: "deterministic skills." },
    { line1: "drafts", line2: "evidence outreach." },
  ];

  // Rotate tagline
  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Rotate headline on page 2
  useEffect(() => {
    if (page !== 2) return;
    const interval = setInterval(() => {
      setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [page]);

  const advancePage = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsKeyPressed(true);

    setTimeout(() => setIsKeyPressed(false), 200);

    setPage((curr) => {
      if (curr === 1) return 2;
      if (curr === 2) return 3;
      return 3;
    });

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  }, []);

  const previousPage = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    setPage((curr) => {
      if (curr === 3) return 2;
      if (curr === 2) return 1;
      return 1;
    });

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 600);
  }, []);

  // Keyboard navigation (Space, ArrowDown, ArrowUp, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === "Space" || e.key === " " || e.key === "ArrowDown" || e.key === "PageDown") {
        if (page < 3) {
          e.preventDefault();
          advancePage();
        }
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        if (page === 2 || (page === 3 && docScrollRef.current?.scrollTop === 0)) {
          e.preventDefault();
          previousPage();
        }
      } else if (e.key === "Escape" || e.key === "Home") {
        setPage(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, advancePage, previousPage]);

  // Wheel navigation
  useEffect(() => {
    let lastWheelTime = 0;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < 450) return;

      if (page === 1 && e.deltaY > 25) {
        lastWheelTime = now;
        advancePage();
      } else if (page === 2) {
        if (e.deltaY > 25) {
          lastWheelTime = now;
          advancePage();
        } else if (e.deltaY < -25) {
          lastWheelTime = now;
          previousPage();
        }
      } else if (page === 3 && docScrollRef.current) {
        if (docScrollRef.current.scrollTop <= 0 && e.deltaY < -40) {
          lastWheelTime = now;
          previousPage();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [page, advancePage, previousPage]);

  // Touch navigation
  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = startY - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) < 40) return;

      if (deltaY > 40 && page < 3) {
        advancePage();
      } else if (deltaY < -40 && (page === 2 || (page === 3 && docScrollRef.current?.scrollTop === 0))) {
        previousPage();
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [page, advancePage, previousPage]);

  return (
    <div id="app" className="w-full h-full select-none">
      {/* SVG Alpha Mask for Keycap Space Cutout */}
      <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
        <defs>
          <mask id="ghost-return-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="70" height="26">
            <rect width="70" height="26" fill="#fff" rx="4" />
            <text
              x="35"
              y="13"
              textAnchor="middle"
              dominantBaseline="central"
              fill="#000"
              style={{
                fontFamily: "Helvetica Neue, Helvetica, Arial, sans-serif",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              space
            </text>
          </mask>
        </defs>
      </svg>

      <div id="stage" className="ghost-stage">
        {/* Multi-stop vertical gradient wash */}
        <div id="gradient-wash" className="ghost-gradient-wash" aria-hidden="true" />

        {/* CRT Scanline Shader & Vignette */}
        <div className="ghost-tv-lines" aria-hidden="true" />
        <div className="ghost-vignette" aria-hidden="true" />

        {/* Persistent Top Bar */}
        <div className="ghost-top-bar">
          <button
            onClick={() => setPage(1)}
            className="flex items-center gap-2.5 text-white text-xs font-mono font-bold tracking-widest uppercase hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <div className="w-4 h-4 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Zap className="w-2.5 h-2.5 text-white" />
            </div>
            <span>SIGNAL — SYSTEM 001</span>
          </button>

          <div className="ghost-tagline">
            <p className="ghost-typing tracking-widest">{TAGLINES[taglineIndex]}</p>
          </div>
        </div>

        {/* Shared Morphing Wordmark */}
        <div
          onClick={() => setPage(1)}
          className={`ghost-wordmark ${page === 1 ? "pos-center" : "pos-topleft"}`}
          aria-label="Signal — return to start"
        >
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              {/* Layer 1: Glow */}
              <h1
                className="text-[96px] sm:text-[140px] md:text-[180px] font-black tracking-tighter leading-none text-white blur-xl opacity-60 absolute inset-0 select-none"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
              >
                SIGNAL
              </h1>

              {/* Layer 2: Main Vector Face */}
              <h1
                className="relative text-[96px] sm:text-[140px] md:text-[180px] font-black tracking-tighter leading-none select-none text-white drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  letterSpacing: "-0.04em",
                }}
              >
                SIGNAL
              </h1>
            </div>

            {page === 1 && (
              <p className="text-white/80 font-mono text-xs sm:text-sm tracking-[0.3em] uppercase mt-2 font-medium">
                Autonomous Multi-Agent Career Intelligence
              </p>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            PAGE 1: Hero Landing
            ═══════════════════════════════════════════════ */}
        <section
          className={`absolute inset-0 transition-all duration-700 ${
            page === 1 ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
          }`}
        >
          {/* Bottom CTA */}
          <div className="ghost-cta">
            <span className="ghost-cta-label">press</span>
            <button
              type="button"
              onClick={advancePage}
              className={`ghost-return-key ${isKeyPressed ? "pressed" : ""}`}
              aria-label="Press space to continue"
            >
              <svg width="70" height="26" viewBox="0 0 70 26" aria-hidden="true" focusable="false">
                <rect width="70" height="26" fill="#ffffff" rx="4" mask="url(#ghost-return-cut)" />
              </svg>
            </button>
            <span className="ghost-cta-label">or</span>
            <span className="ghost-cta-label">scroll to continue</span>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            PAGE 2: Builds / Tracks Headline Stage
            ═══════════════════════════════════════════════ */}
        <section
          className={`absolute inset-0 transition-all duration-700 ${
            page === 2 ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
          }`}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white select-none">
            <p
              className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-tight text-white/80"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {HEADLINES[headlineIndex].line1}
            </p>
            <p
              className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-tight text-white"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
            >
              {HEADLINES[headlineIndex].line2}
            </p>
          </div>

          {/* Bottom CTA */}
          <div className="ghost-cta">
            <span className="ghost-cta-label">press</span>
            <button
              type="button"
              onClick={advancePage}
              className={`ghost-return-key ${isKeyPressed ? "pressed" : ""}`}
              aria-label="Press space to continue"
            >
              <svg width="70" height="26" viewBox="0 0 70 26" aria-hidden="true" focusable="false">
                <rect width="70" height="26" fill="#ffffff" rx="4" mask="url(#ghost-return-cut)" />
              </svg>
            </button>
            <span className="ghost-cta-label">or</span>
            <span className="ghost-cta-label">scroll to continue</span>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            PAGE 3: Blueprint Manifesto & Document Scroll
            ═══════════════════════════════════════════════ */}
        <section
          className={`absolute inset-0 transition-all duration-700 ${
            page === 3 ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
          }`}
        >
          <div
            ref={docScrollRef}
            className="absolute inset-0 overflow-y-auto overscroll-none pt-28 pb-16 px-4 sm:px-6 z-20"
          >
            <div className="max-w-[820px] mx-auto space-y-12">
              {/* Blueprint Plotter Sheet */}
              <article className="ghost-blueprint-paper p-8 sm:p-14 relative">
                {/* Drafting Rulers */}
                <div className="ghost-blueprint-ruler-left" />
                <div className="ghost-blueprint-ruler-right" />

                {/* Blueprint Header */}
                <header className="flex items-center justify-between pb-8 border-b border-[#006ddf]/20 pl-4 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 bg-[#006ddf] rounded-sm" />
                    <span className="font-mono text-xs font-bold text-[#006ddf] tracking-widest uppercase">
                      SYSTEM 001 · MULTI-AGENT PIPELINE
                    </span>
                  </div>
                  <p className="font-mono text-xs font-semibold text-[#006ddf]/60 tracking-wider">
                    © 2026 SIGNAL
                  </p>
                </header>

                {/* Manifesto Text */}
                <div className="ghost-system-copy py-8 pl-4 pr-4 space-y-6 text-sm sm:text-base">
                  <p>
                    For forty years, job applications have worked the same way. Spreadsheets, lost emails, silent ATS drops, and overwhelming noise. With multi-agent AI, that changes. The next career interface understands your verified engineering capability and acts autonomously on your behalf.
                  </p>
                  <p>
                    Signal orchestrates a 6-agent LangGraph workflow built natively on Google Cloud. It ingests recruiter emails via Cloud Pub/Sub, audits codebases deterministically with MINSKY commit forensics, performs semantic ATS gap analysis, synchronizes real-time pipeline stages across Cloud Firestore, drafts evidence-backed outreach with Gemini 2.5 Flash, and dispatches interview prep alerts through Cloud Tasks.
                  </p>
                  <p>
                    Job tracking should not be manual drudgery. You should not have to spend hours re-typing your credentials into black-hole applicant portals while your applications go un-answered.
                  </p>
                  <p>
                    That career intelligence, its proof badges, and your live opportunity pipeline belong entirely to you.
                  </p>
                  <p className="font-bold">
                    The AI era needs a new class of career software. Signal is building it.
                  </p>
                </div>

                {/* Interactive Agents Quick Launcher inside Blueprint */}
                <div className="mt-8 pt-8 border-t border-[#006ddf]/20 pl-4 pr-4">
                  <p className="font-mono text-xs font-bold text-[#006ddf] uppercase tracking-widest mb-4">
                    // DEPLOYED AGENT FLEET
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      {
                        title: "Live Kanban Tracker",
                        tag: "Tracking Agent",
                        href: "/dashboard/tracker",
                        icon: Kanban,
                        desc: "Sub-second Cloud Firestore sync",
                      },
                      {
                        title: "Email & Ingestion Agent",
                        tag: "Pub/Sub",
                        href: "/dashboard/tracker?tab=pipeline",
                        icon: Mail,
                        desc: "Auto-parse recruiter email stream",
                      },
                      {
                        title: "MINSKY Code Forensics",
                        tag: "GitProof",
                        href: "/dashboard/tracker?tab=minsky",
                        icon: ShieldCheck,
                        desc: "Cryptographic commit proof scores",
                      },
                      {
                        title: "Career Optimization Agent",
                        tag: "ATS Alignment",
                        href: "/dashboard/tracker?tab=optimize",
                        icon: TrendingUp,
                        desc: "Semantic keyword gap analysis",
                      },
                      {
                        title: "AI Drafting Agent",
                        tag: "Gemini 2.5 Flash",
                        href: "/dashboard/tracker?tab=draft",
                        icon: Sparkles,
                        desc: "Evidence-backed cover letters",
                      },
                      {
                        title: "Scheduled Nudges",
                        tag: "Cloud Tasks",
                        href: "/dashboard/tracker?tab=nudges",
                        icon: Clock,
                        desc: "Time-sensitive follow-up queues",
                      },
                    ].map((agent) => (
                      <Link
                        key={agent.title}
                        href={agent.href}
                        className="group flex items-start justify-between p-3.5 rounded-lg border border-[#006ddf]/20 bg-white/60 hover:bg-white hover:border-[#006ddf]/50 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded bg-[#006ddf]/10 text-[#006ddf] flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-[#006ddf] group-hover:text-white transition-colors">
                            <agent.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#006ddf] leading-tight">
                              {agent.title}
                            </h4>
                            <p className="text-[11px] text-[#006ddf]/70 mt-0.5 font-mono">
                              {agent.desc}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-[#006ddf]/50 group-hover:text-[#006ddf] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                      </Link>
                    ))}
                  </div>

                  {/* Primary Launcher CTA */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                    <Link
                      href="/dashboard/tracker"
                      className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-lg bg-[#006ddf] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#005bb8] transition-colors shadow-md"
                    >
                      <Zap className="w-4 h-4" />
                      Launch Multi-Agent Command Center
                    </Link>
                    <Link
                      href="/dashboard"
                      className="w-full sm:w-auto py-3.5 px-6 rounded-lg border border-[#006ddf]/30 bg-white/70 text-[#006ddf] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white transition-colors"
                    >
                      View Skill Passport
                    </Link>
                  </div>
                </div>
              </article>

              {/* GCP Infrastructure Row */}
              <div className="py-4 text-center">
                <p className="text-white/60 text-xs font-mono tracking-widest uppercase mb-4">
                  POWERED BY GOOGLE CLOUD & GEMINI
                </p>
                <div className="flex flex-wrap items-center justify-center gap-6 text-white/80 text-xs font-mono">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/20 backdrop-blur-sm">
                    <Bot className="w-3.5 h-3.5 text-blue-300" />
                    Gemini 2.5 Flash
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/20 backdrop-blur-sm">
                    <Radio className="w-3.5 h-3.5 text-violet-300" />
                    Cloud Pub/Sub
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/20 backdrop-blur-sm">
                    <Database className="w-3.5 h-3.5 text-emerald-300" />
                    Cloud Firestore
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/20 backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    Cloud Tasks
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/20 backdrop-blur-sm">
                    <Cpu className="w-3.5 h-3.5 text-pink-300" />
                    Cloud Run
                  </span>
                </div>
              </div>

              {/* Industrial Titanium Debossed Footer */}
              <div className="ghost-footer-metal rounded-2xl p-8 sm:p-12 text-white/80 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white tracking-widest font-mono uppercase">
                      SIGNAL
                    </span>
                  </div>
                  <p className="text-xs text-white/50 font-mono">
                    Track 03 — AI Job Application Tracker · Code Kitchen 2026
                  </p>
                </div>

                <div className="flex items-center gap-6 text-xs font-mono text-white/60">
                  <Link href="/dashboard/tracker" className="hover:text-white transition-colors">
                    Tracker
                  </Link>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Passport
                  </Link>
                  <a
                    href="https://github.com/uselessdevloper/signal-"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white transition-colors flex items-center gap-1"
                  >
                    GitHub
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-[11px] font-mono text-white/40">
                  © 2026 SIGNAL. ALL RIGHTS RESERVED.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

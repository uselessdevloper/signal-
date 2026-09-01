"use client";

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import Link from "next/link";
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
  AlertTriangle,
  FileCheck2,
} from "lucide-react";

// Isolated Tagline Rotator (zero re-render of parent stage)
const TaglineRotator = memo(function TaglineRotator() {
  const TAGLINES = [
    "TRACK 03 · AUTONOMOUS AI JOB APPLICATION TRACKER",
    "6-AGENT LANGGRAPH PIPELINE ON GOOGLE CLOUD",
    "EMAIL PARSING · MINSKY GITPROOF · REAL-TIME KANBAN",
    "GEMINI 2.5 FLASH · CLOUD PUB/SUB · CLOUD FIRESTORE",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [TAGLINES.length]);

  return <p className="ghost-typing tracking-widest">{TAGLINES[index]}</p>;
});

// Isolated Headline Rotator (zero re-render of parent stage)
const HeadlineRotator = memo(function HeadlineRotator({ isActive }: { isActive: boolean }) {
  const HEADLINES = [
    { line1: "tracks every", line2: "job application." },
    { line1: "parses recruiter", line2: "emails autonomously." },
    { line1: "verifies github", line2: "proof of skill." },
    { line1: "defeats silent", line2: "ats resume filters." },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % HEADLINES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isActive, HEADLINES.length]);

  return (
    <>
      <p
        className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight leading-tight text-white/80 transition-opacity duration-300"
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        {HEADLINES[index].line1}
      </p>
      <p
        className="text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight leading-tight text-white mt-1 transition-opacity duration-300"
        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
      >
        {HEADLINES[index].line2}
      </p>
    </>
  );
});

export default function GhostLandingPage() {
  const [page, setPage] = useState<1 | 2 | 3>(1);
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const isTransitioningRef = useRef(false);
  const docScrollRef = useRef<HTMLDivElement>(null);
  const wheelAccumulatorRef = useRef(0);

  const advancePage = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    setIsKeyPressed(true);
    setTimeout(() => setIsKeyPressed(false), 150);

    requestAnimationFrame(() => {
      setPage((curr) => (curr < 3 ? ((curr + 1) as 1 | 2 | 3) : 3));
    });

    setTimeout(() => {
      isTransitioningRef.current = false;
      wheelAccumulatorRef.current = 0;
    }, 450);
  }, []);

  const previousPage = useCallback(() => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    requestAnimationFrame(() => {
      setPage((curr) => (curr > 1 ? ((curr - 1) as 1 | 2 | 3) : 1));
    });

    setTimeout(() => {
      isTransitioningRef.current = false;
      wheelAccumulatorRef.current = 0;
    }, 450);
  }, []);

  // Instant Keydown Navigation
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

    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [page, advancePage, previousPage]);

  // Zero-Latency Wheel Navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isTransitioningRef.current) return;

      wheelAccumulatorRef.current += e.deltaY;

      if (page === 1 && wheelAccumulatorRef.current > 25) {
        wheelAccumulatorRef.current = 0;
        advancePage();
      } else if (page === 2) {
        if (wheelAccumulatorRef.current > 25) {
          wheelAccumulatorRef.current = 0;
          advancePage();
        } else if (wheelAccumulatorRef.current < -25) {
          wheelAccumulatorRef.current = 0;
          previousPage();
        }
      } else if (page === 3 && docScrollRef.current) {
        if (docScrollRef.current.scrollTop <= 0 && wheelAccumulatorRef.current < -45) {
          wheelAccumulatorRef.current = 0;
          previousPage();
        }
      }

      setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 300);
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [page, advancePage, previousPage]);

  // Touch Navigation
  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = startY - e.changedTouches[0].clientY;
      if (Math.abs(deltaY) < 35) return;

      if (deltaY > 35 && page < 3) {
        advancePage();
      } else if (deltaY < -35 && (page === 2 || (page === 3 && docScrollRef.current?.scrollTop === 0))) {
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
    <div id="app" className="w-full h-full select-none overflow-hidden">
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
        {/* Hardware-Accelerated Gradient Wash */}
        <div id="gradient-wash" className="ghost-gradient-wash" aria-hidden="true" />

        {/* Lightweight CRT & Vignette */}
        <div className="ghost-tv-lines" aria-hidden="true" />
        <div className="ghost-vignette" aria-hidden="true" />

        {/* Top Header Bar */}
        <div className="ghost-top-bar">
          <button
            onClick={() => setPage(1)}
            className="flex items-center gap-2.5 text-white text-xs font-mono font-bold tracking-widest uppercase hover:opacity-80 transition-opacity cursor-pointer text-left"
          >
            <div className="w-4 h-4 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-sm">
              <Zap className="w-2.5 h-2.5 text-white" />
            </div>
            <span>SIGNAL · AI JOB TRACKER</span>
          </button>

          <div className="ghost-tagline">
            <TaglineRotator />
          </div>
        </div>

        {/* Morphing Wordmark */}
        <div
          onClick={() => setPage(1)}
          className={`ghost-wordmark ${page === 1 ? "pos-center" : "pos-topleft"}`}
          aria-label="Signal — return to home"
        >
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <h1
                className="relative text-[92px] sm:text-[135px] md:text-[175px] font-black tracking-tighter leading-none select-none text-white drop-shadow-[0_12px_24px_rgba(0,0,0,0.35)]"
                style={{
                  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                  letterSpacing: "-0.04em",
                }}
              >
                SIGNAL
              </h1>
            </div>

            {page === 1 && (
              <p className="text-white/85 font-mono text-xs sm:text-sm tracking-[0.28em] uppercase mt-2 font-medium">
                Autonomous Multi-Agent Career Pipeline
              </p>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            PAGE 1: Hero Landing
            ═══════════════════════════════════════════════ */}
        <section
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            page === 1 ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
          }`}
        >
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
            PAGE 2: Dynamic Problem/Action Headline
            ═══════════════════════════════════════════════ */}
        <section
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            page === 2 ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
          }`}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white select-none w-full max-w-3xl px-4">
            <HeadlineRotator isActive={page === 2} />
            <p className="mt-6 text-white/70 font-mono text-xs sm:text-sm tracking-wider uppercase max-w-xl mx-auto">
              LangGraph Multi-Agent Orchestration · 6 Agents · Google Cloud
            </p>
          </div>

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
          className={`absolute inset-0 transition-all duration-500 ease-out ${
            page === 3 ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
          }`}
        >
          <div
            ref={docScrollRef}
            className="absolute inset-0 overflow-y-auto overscroll-contain pt-24 sm:pt-28 pb-16 px-4 sm:px-6 z-20 scroll-smooth"
            style={{ WebkitOverflowScrolling: "touch", transform: "translateZ(0)" }}
          >
            <div className="max-w-[840px] mx-auto space-y-10">
              {/* Plotter Paper Blueprint Sheet */}
              <article className="ghost-blueprint-paper p-6 sm:p-12 relative shadow-2xl">
                <div className="ghost-blueprint-ruler-left" />
                <div className="ghost-blueprint-ruler-right" />

                {/* Blueprint Header */}
                <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#006ddf]/20 pl-3 pr-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 bg-[#006ddf] rounded-sm" />
                    <span className="font-mono text-xs font-bold text-[#006ddf] tracking-widest uppercase">
                      SYSTEM 001 · AI JOB APPLICATION TRACKER
                    </span>
                  </div>
                  <p className="font-mono text-xs font-semibold text-[#006ddf]/70 tracking-wider">
                    TRACK 03 · CODE KITCHEN 2026
                  </p>
                </header>

                {/* Problem & Approach Manifesto */}
                <div className="ghost-system-copy py-6 pl-3 pr-3 space-y-5 text-sm sm:text-[15px] leading-relaxed">
                  {/* Problem Callout Box */}
                  <div className="p-4 rounded border border-[#006ddf]/25 bg-[#006ddf]/[0.04] space-y-2">
                    <div className="flex items-center gap-2 text-[#006ddf] font-bold text-xs font-mono uppercase tracking-wider">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      The Problem We Solve
                    </div>
                    <p className="text-[#006ddf] text-xs sm:text-sm leading-normal">
                      Suppose you are a student ready for your career, but lost in the noise, unsure, overwhelmed by tracking dozens of applications, and facing silent ATS resume rejections. You miss critical recruiter reply dates, send generic cover letters, and have no deterministic way to prove your technical skills.
                    </p>
                  </div>

                  {/* Solution Manifesto */}
                  <p>
                    <strong>Signal changes this completely.</strong> An autonomous <strong>LangGraph multi-agent pipeline</strong> running natively on Google Cloud orchestrates the complete student career workflow from first application to final offer:
                  </p>
                </div>

                {/* 6 Specialized Agents Breakdown */}
                <div className="my-6 pl-3 pr-3 space-y-3">
                  <p className="font-mono text-xs font-bold text-[#006ddf] uppercase tracking-widest">
                    // 6-AGENT LANGGRAPH PIPELINE
                  </p>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      {
                        num: "01",
                        title: "Email & Ingestion Agent",
                        badge: "Cloud Pub/Sub",
                        icon: Mail,
                        desc: "Connects to Gmail via Pub/Sub push topics to autonomously parse recruiter emails, extract interview dates & companies, and auto-update Kanban cards with zero manual data entry.",
                        href: "/dashboard/tracker?tab=pipeline",
                      },
                      {
                        num: "02",
                        title: "MINSKY (GitProof Agent)",
                        badge: "Forensics Engine",
                        icon: ShieldCheck,
                        desc: "Audits your GitHub repositories, verifying GPG/SSH cryptographic commit signatures and calculating deterministic proof-of-skill scores (0–100) using AST and code entropy metrics.",
                        href: "/dashboard/tracker?tab=minsky",
                      },
                      {
                        num: "03",
                        title: "Career Optimization Agent",
                        badge: "Semantic ATS",
                        icon: TrendingUp,
                        desc: "Performs semantic gap analysis between your verified skills and job requirements to pinpoint missing keywords and optimize alignment before ATS drop filters run.",
                        href: "/dashboard/tracker?tab=optimize",
                      },
                      {
                        num: "04",
                        title: "Tracking Agent",
                        badge: "Cloud Firestore",
                        icon: Kanban,
                        desc: "Powers a real-time Kanban board managing live application stages (Applied, Screening, Interview, Offer, Rejected) with sub-140ms Firestore document sync.",
                        href: "/dashboard/tracker?tab=kanban",
                      },
                      {
                        num: "05",
                        title: "AI Drafting Agent",
                        badge: "Gemini 2.5 Flash",
                        icon: Sparkles,
                        desc: "Generates personalized, evidence-backed cover letters and cold outreach messages referencing verified GitProof data rather than generic template boilerplate.",
                        href: "/dashboard/tracker?tab=draft",
                      },
                      {
                        num: "06",
                        title: "Scheduled Nudge Agent",
                        badge: "Cloud Tasks",
                        icon: Clock,
                        desc: "Dispatches automated, time-sensitive follow-up reminders, 24-hour interview prep alerts, and queue notifications via Google Cloud Tasks.",
                        href: "/dashboard/tracker?tab=nudges",
                      },
                    ].map((agent) => (
                      <Link
                        key={agent.num}
                        href={agent.href}
                        className="group flex flex-col justify-between p-4 rounded-lg border border-[#006ddf]/20 bg-white/70 hover:bg-white hover:border-[#006ddf]/50 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-[#006ddf]/10 text-[#006ddf] flex items-center justify-center font-mono text-xs font-bold group-hover:bg-[#006ddf] group-hover:text-white transition-colors">
                                {agent.num}
                              </div>
                              <h4 className="text-xs font-bold text-[#006ddf] leading-tight">
                                {agent.title}
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#006ddf]/10 text-[#006ddf] font-semibold">
                              {agent.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[#006ddf]/75 leading-relaxed font-sans">
                            {agent.desc}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#006ddf] mt-3 group-hover:translate-x-0.5 transition-transform">
                          <span>Open Agent Control</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="mt-8 pt-6 border-t border-[#006ddf]/20 pl-3 pr-3 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href="/dashboard/tracker"
                    className="w-full sm:w-auto flex-1 py-3.5 px-6 rounded-lg bg-[#006ddf] text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#005bb8] transition-colors shadow-md"
                  >
                    <Zap className="w-4 h-4" />
                    Open Live Application Tracker
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full sm:w-auto py-3.5 px-6 rounded-lg border border-[#006ddf]/30 bg-white/75 text-[#006ddf] text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white transition-colors"
                  >
                    <FileCheck2 className="w-4 h-4" />
                    View Verified Skill Passport
                  </Link>
                </div>
              </article>

              {/* Google Cloud Infrastructure Strip */}
              <div className="py-2 text-center">
                <p className="text-white/60 text-xs font-mono tracking-widest uppercase mb-3">
                  BUILT NATIVELY ON GOOGLE CLOUD
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-white text-xs font-mono">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/15 backdrop-blur-sm">
                    <Bot className="w-3.5 h-3.5 text-blue-300" />
                    Gemini 2.5 Flash
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/15 backdrop-blur-sm">
                    <Radio className="w-3.5 h-3.5 text-violet-300" />
                    Cloud Pub/Sub
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/15 backdrop-blur-sm">
                    <Database className="w-3.5 h-3.5 text-emerald-300" />
                    Cloud Firestore
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/15 backdrop-blur-sm">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    Cloud Tasks
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-md border border-white/15 backdrop-blur-sm">
                    <Cpu className="w-3.5 h-3.5 text-pink-300" />
                    Cloud Run
                  </span>
                </div>
              </div>

              {/* Brushed Industrial Metal Footer */}
              <footer className="ghost-footer-metal rounded-2xl p-6 sm:p-10 text-white/80 flex flex-col md:flex-row items-center justify-between gap-6">
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

                <div className="flex items-center gap-6 text-xs font-mono text-white/70">
                  <Link href="/dashboard/tracker" className="hover:text-white transition-colors">
                    Tracker
                  </Link>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    Skill Passport
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
              </footer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

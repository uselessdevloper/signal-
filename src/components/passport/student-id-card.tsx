"use client";

import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { User, GraduationCap, BookOpen, Award, FileBadge } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Deterministic Barcode SVG Generator ---
function BarcodeSVG({ value, height = 40, className }: { value: string; height?: number; className?: string }) {
  const bars = useMemo(() => {
    // Standard pseudo-Code128 deterministic pattern based on char codes
    const result: number[] = [2, 1, 2, 1]; // Start guard
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      const b1 = (code % 3) + 1;
      const b2 = ((code >> 2) % 3) + 1;
      const b3 = ((code >> 4) % 3) + 1;
      const b4 = ((code >> 6) % 2) + 1;
      result.push(b1, b2, b3, b4);
    }
    result.push(2, 3, 1, 2); // Stop guard
    return result;
  }, [value]);

  return (
    <svg viewBox={`0 0 ${bars.length * 3} ${height}`} className={cn("w-full max-w-[180px] h-10", className)}>
      {bars.map((width, idx) => {
        const isBlack = idx % 2 === 0;
        const x = bars.slice(0, idx).reduce((acc, curr) => acc + curr * 1.5, 0);
        return isBlack ? (
          <rect key={idx} x={x} y="0" width={width * 1.5} height={height} fill="#091b3d" />
        ) : null;
      })}
    </svg>
  );
}

// --- Signal Holographic Circular Verification Seal ---
function SignalVerificationSeal() {
  return (
    <div className="relative w-28 h-28 flex items-center justify-center select-none">
      {/* Outer Rotated Badge SVG with Text on Path */}
      <svg viewBox="0 0 120 120" className="w-full h-full text-[#0b2559]">
        <defs>
          <path
            id="sealCircleTop"
            d="M 60,60 m -45,0 a 45,45 0 1,1 90,0"
            fill="none"
          />
          <path
            id="sealCircleBottom"
            d="M 60,60 m 45,0 a 45,45 0 1,1 -90,0"
            fill="none"
          />
        </defs>

        {/* Concentric Decorative Rings */}
        <circle cx="60" cy="60" r="56" fill="none" stroke="#0b2559" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="#0b2559" strokeWidth="2" />
        <circle cx="60" cy="60" r="38" fill="none" stroke="#0b2559" strokeWidth="1" opacity="0.6" />

        {/* Text Along Path */}
        <text fontSize="7.5" fontWeight="bold" letterSpacing="2.5" fill="#0b2559">
          <textPath href="#sealCircleTop" startOffset="50%" textAnchor="middle">
            ★ SIGNAL VERIFIED ★
          </textPath>
        </text>

        <text fontSize="6" fontWeight="bold" letterSpacing="1.8" fill="#0b2559">
          <textPath href="#sealCircleBottom" startOffset="50%" textAnchor="middle">
            ACHIEVEMENTS · TRUST · IMPACT
          </textPath>
        </text>

        {/* Inner Double Monogram Emblem */}
        <g transform="translate(42, 42) scale(0.6)">
          <path
            d="M 40 10 L 20 10 C 10 10 5 15 5 25 L 5 35 C 5 45 10 50 20 50 L 40 50 L 40 42 L 20 42 C 15 42 13 40 13 35 L 13 25 C 13 20 15 18 20 18 L 40 18 Z"
            fill="#0b2559"
          />
          <path
            d="M 50 18 L 30 18 C 22 18 18 22 18 30 L 18 40 C 18 48 22 52 30 52 L 50 52 L 50 44 L 30 44 C 25 44 24 42 24 38 L 24 32 C 24 28 25 26 30 26 L 50 26 Z"
            fill="#0b2559"
            opacity="0.85"
          />
        </g>
      </svg>
    </div>
  );
}

// --- Circuit Badge Icon ---
function CircuitBadgeIcon() {
  return (
    <svg viewBox="0 0 40 24" className="w-9 h-6 text-[#0b2559]">
      <rect x="2" y="2" width="36" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="0" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="2" />
      <line x1="26" y1="12" x2="40" y2="12" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="12" r="5" fill="currentColor" />
      <circle cx="20" cy="12" r="2" fill="#fff" />
    </svg>
  );
}

export interface StudentPassportProps {
  studentData?: {
    cardId?: string;
    studentId?: string;
    name?: string;
    gender?: string;
    degree?: string;
    college?: string;
    avatarUrl?: string;
    issueDate?: string;
    expiryDate?: string;
    coursesCompleted?: number;
    skillsVerified?: number;
    certificatesEarned?: number;
    verificationUrl?: string;
  };
  className?: string;
}

export function StudentPassportIdCard({ studentData, className }: StudentPassportProps) {
  const cardId = studentData?.cardId || "SIG2026-000742";
  const studentId = studentData?.studentId || "SIG26S7421";
  const name = studentData?.name || "Jane Doe";
  const gender = studentData?.gender || "Female";
  const degree = studentData?.degree || "B.Tech – Computer Science Engineering";
  const issueDate = studentData?.issueDate || "18 MAY 2026";
  const expiryDate = studentData?.expiryDate || "17 MAY 2028";
  const coursesCompleted = studentData?.coursesCompleted ?? 14;
  const skillsVerified = studentData?.skillsVerified ?? 12;
  const certificatesEarned = studentData?.certificatesEarned ?? 3;

  const verificationUrl =
    studentData?.verificationUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/verify/passport/${studentId}`
      : `https://signal.dev/verify/passport/${studentId}`);

  // Default Illustrated Female Avatar if none provided
  const avatarUrl =
    studentData?.avatarUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";

  return (
    <div
      className={cn(
        "w-full max-w-[420px] bg-[#f8fbff] text-[#091b3d] rounded-[32px] p-6 border border-[#d2e2f8] shadow-2xl relative font-sans select-none overflow-hidden",
        className
      )}
      style={{
        boxShadow: "0 25px 60px -15px rgba(11, 37, 89, 0.15), 0 0 0 1px rgba(11, 37, 89, 0.08)",
      }}
    >
      {/* Background Watermark Security Pattern */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#0b2559 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />

      {/* Top Header: ID & Circuit Icon */}
      <div className="flex items-center justify-between pb-4 border-b border-[#e1ecfb] relative z-10">
        <span className="text-xs font-extrabold tracking-wider text-[#0b2559] uppercase">
          ID: {cardId}
        </span>
        <CircuitBadgeIcon />
      </div>

      {/* Holder Info */}
      <div className="pt-4 pb-3 relative z-10">
        <span className="text-[10px] font-extrabold tracking-widest text-[#4b648b] uppercase block mb-0.5">
          HOLDER
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#08152e] leading-tight">
          {name}
        </h1>

        <div className="flex flex-col gap-1 mt-1.5 text-xs font-semibold text-[#304870]">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#0b2559]" />
            <span>{gender}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-[#0b2559]" />
            <span className="truncate">{degree}</span>
          </div>
        </div>
      </div>

      {/* Photo & Seal Row */}
      <div className="grid grid-cols-2 gap-4 items-center my-3 relative z-10">
        {/* Student Portrait */}
        <div className="w-36 h-40 rounded-2xl border-2 border-[#b8d6fc] bg-[#eaf3fe] overflow-hidden shadow-inner flex items-center justify-center p-1">
          <img
            src={avatarUrl}
            alt={name}
            className="w-full h-full object-cover object-top rounded-xl"
          />
        </div>

        {/* Verification Seal */}
        <div className="flex items-center justify-center">
          <SignalVerificationSeal />
        </div>
      </div>

      {/* Student ID, Barcode & Issue Dates */}
      <div className="grid grid-cols-2 gap-4 items-start pt-2 pb-3 relative z-10">
        <div>
          <span className="text-[10px] font-extrabold tracking-widest text-[#4b648b] uppercase block">
            STUDENT ID
          </span>
          <span className="text-sm font-bold tracking-wider text-[#08152e] block mb-1 font-mono">
            {studentId}
          </span>
          <BarcodeSVG value={studentId} />
        </div>

        <div className="flex flex-col gap-2 pl-2">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#4b648b] uppercase block">
              DATE OF ISSUE
            </span>
            <span className="text-xs font-bold text-[#08152e] tracking-wide">
              {issueDate}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#4b648b] uppercase block">
              VALID UNTIL
            </span>
            <span className="text-xs font-bold text-[#08152e] tracking-wide">
              {expiryDate}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#dbe8fa] my-2" />

      {/* Statistics Row: Courses / Skills / Certs */}
      <div className="grid grid-cols-3 divide-x divide-[#dbe8fa] text-center py-2 relative z-10">
        <div className="px-1 flex flex-col items-center">
          <BookOpen className="w-4 h-4 text-[#0b2559] mb-1" />
          <span className="text-[9px] font-bold tracking-wider text-[#4b648b] uppercase leading-tight">
            COURSES COMPLETED
          </span>
          <span className="text-lg font-extrabold text-[#08152e] mt-0.5">
            {coursesCompleted.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="px-1 flex flex-col items-center">
          <Award className="w-4 h-4 text-[#0b2559] mb-1" />
          <span className="text-[9px] font-bold tracking-wider text-[#4b648b] uppercase leading-tight">
            SKILLS VERIFIED
          </span>
          <span className="text-lg font-extrabold text-[#08152e] mt-0.5">
            {skillsVerified.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="px-1 flex flex-col items-center">
          <FileBadge className="w-4 h-4 text-[#0b2559] mb-1" />
          <span className="text-[9px] font-bold tracking-wider text-[#4b648b] uppercase leading-tight">
            CERTIFICATES EARNED
          </span>
          <span className="text-lg font-extrabold text-[#08152e] mt-0.5">
            {certificatesEarned.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-[#dbe8fa] my-2" />

      {/* Footer: Signature & QR Code */}
      <div className="flex items-end justify-between pt-2 relative z-10">
        <div className="flex flex-col items-start pb-1">
          {/* Cursive Handwriting Signature */}
          <span
            className="text-2xl font-serif italic text-[#08152e] tracking-wider leading-none mb-1 select-none"
            style={{
              fontFamily: "'Brush Script MT', 'Dancing Script', 'Caveat', cursive",
              transform: "rotate(-2deg)",
            }}
          >
            {name}
          </span>
          <div className="w-28 h-px bg-[#08152e] mb-1" />
          <span className="text-[8px] font-extrabold tracking-widest text-[#4b648b] uppercase">
            AUTHORIZED SIGNATURE
          </span>
        </div>

        {/* Real Verifiable QR Code */}
        <div className="p-1.5 bg-white border border-[#c8dcf7] rounded-xl shadow-sm flex items-center justify-center">
          <QRCodeSVG
            value={verificationUrl}
            size={56}
            level="M"
            fgColor="#091b3d"
            bgColor="#ffffff"
          />
        </div>
      </div>
    </div>
  );
}

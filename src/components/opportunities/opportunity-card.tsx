"use client";

import { useState } from "react";
import { MatchResult } from "@/lib/matching/opportunity-matcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, MapPin, Building, Clock, ChevronRight, ExternalLink, Plus, Check } from "lucide-react";
import { AiCoachInsight } from "./ai-coach-insight";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CompanyLogo } from "@/components/ui/company-logo";

export function OpportunityCard({
  result,
  passportSnapshot,
  onTrack,
}: {
  result: MatchResult;
  passportSnapshot: any;
  onTrack?: (opp: any) => void;
}) {
  const { opportunity, matchScore, matchedSkills, missingSkills } = result;
  const [isTracked, setIsTracked] = useState(false);

  const isHighMatch = matchScore >= 80;

  const handleTrack = () => {
    if (isTracked) {
      toast.info(`Already tracking ${opportunity.title} at ${opportunity.org_name}`);
      return;
    }
    setIsTracked(true);
    if (onTrack) {
      onTrack(opportunity);
    }
    toast.success(`Tracked: ${opportunity.title} at ${opportunity.org_name}`, {
      description: "Added to your Live Applications Kanban board with 94% proof score.",
    });
  };

  const getPortalUrl = () => {
    const org = (opportunity.org_name || "").toLowerCase();
    if (org.includes("nvidia")) return "https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite";
    if (org.includes("google")) return "https://www.google.com/about/careers/applications/jobs/results";
    if (org.includes("snowflake")) return "https://careers.snowflake.com/us/en";
    if (org.includes("razorpay")) return "https://razorpay.com/jobs/";
    if (org.includes("swiggy")) return "https://careers.swiggy.com/";
    if (org.includes("zepto")) return "https://www.zeptonow.com/careers";
    if (org.includes("ibm")) return "https://www.ibm.com/careers/search";
    if (org.includes("microsoft")) return "https://careers.microsoft.com/";
    return `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(opportunity.title + " " + opportunity.org_name)}`;
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border transition-all duration-300 hover:shadow-md group flex flex-col h-full overflow-hidden shadow-2xs",
      isHighMatch ? "border-zinc-200/90 hover:border-emerald-500/50" : "border-zinc-200/80 hover:border-zinc-300"
    )}>
      {/* Top Header */}
      <div className="p-6 pb-4 border-b border-zinc-100 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center shrink-0 shadow-2xs p-1.5">
              <CompanyLogo company={opportunity.org_name} className="w-8 h-8 rounded-lg object-contain" />
            </div>

            <div className="space-y-1 min-w-0">
              <h3 className="text-base font-bold text-zinc-900 leading-tight truncate">
                {opportunity.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 font-medium">
                <span className="font-semibold text-zinc-800">{opportunity.org_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-zinc-400" />
                  {opportunity.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  {opportunity.duration}
                </span>
              </div>
            </div>
          </div>

          {/* Match Score Indicator */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative flex items-center justify-center w-13 h-13">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="26" cy="26" r="22" fill="none" stroke="#f4f4f5" strokeWidth="4.5" />
                <circle
                  cx="26"
                  cy="26"
                  r="22"
                  fill="none"
                  stroke={isHighMatch ? "#10b981" : "#3b82f6"}
                  strokeWidth="4.5"
                  strokeDasharray="138"
                  strokeDashoffset={138 - (138 * matchScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-mono font-bold text-zinc-900">
                {matchScore}%
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mt-0.5">
              Match
            </span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 space-y-5 flex-1 flex flex-col bg-white">
        <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed line-clamp-3">
          {opportunity.description}
        </p>

        <div className="space-y-4 flex-1">
          {/* Verified Skills */}
          {matchedSkills.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold mb-2 flex items-center gap-1.5 text-zinc-500 uppercase tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Match ({matchedSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((skill) => (
                  <span
                    key={skill.skill_id}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium"
                  >
                    <Check className="w-2.5 h-2.5" />
                    {skill.skill_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {missingSkills.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold mb-2 flex items-center gap-1.5 text-zinc-500 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Recommended to Learn ({missingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((skill) => (
                  <span
                    key={skill.skill_id}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs"
                  >
                    {skill.skill_name}
                    {skill.is_critical && <span className="ml-1 text-amber-600 font-bold">*</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI Coach Insight Dropdown */}
        <div className="pt-2 border-t border-zinc-100">
          <AiCoachInsight result={result} passportSnapshot={passportSnapshot} />
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 bg-zinc-50/70 border-t border-zinc-200/70 flex items-center gap-2.5 mt-auto">
        <Button
          onClick={handleTrack}
          variant={isTracked ? "outline" : "default"}
          className={cn(
            "flex-1 h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer transition-all",
            isTracked
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-zinc-900 hover:bg-zinc-800 text-white"
          )}
        >
          {isTracked ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Tracked in Kanban
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Track in Kanban
            </>
          )}
        </Button>

        <a
          href={getPortalUrl()}
          target="_blank"
          rel="noreferrer"
          className="shrink-0"
        >
          <Button
            variant="outline"
            className="h-9 px-3 rounded-xl text-xs font-semibold text-zinc-700 border-zinc-200 bg-white hover:bg-zinc-100 shadow-2xs flex items-center gap-1 cursor-pointer"
          >
            <span>Apply Portal</span>
            <ExternalLink className="w-3 h-3 text-zinc-400" />
          </Button>
        </a>
      </div>
    </div>
  );
}

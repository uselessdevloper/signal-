"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Target, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { matchOpportunity, checkMatchJobStatus } from "@/actions/matcher";

export function OpportunityMatcher() {
  const [jobDescription, setJobDescription] = useState("");
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (jobId && (status === "pending" || status === "processing")) {
      interval = setInterval(async () => {
        const res = await checkMatchJobStatus(jobId);
        
        if (res.error) {
          setError(res.error);
          setStatus("failed");
          clearInterval(interval);
          return;
        }

        setStatus(res.status);

        if (res.status === "completed") {
          setResult({
            match_score: res.match_score,
            gap_analysis: res.gap_analysis,
            explainable_text: res.explainable_text,
          });
          clearInterval(interval);
        } else if (res.status === "failed") {
          setError(res.error_message || "Match failed.");
          clearInterval(interval);
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [jobId, status]);

  const handleMatch = async () => {
    if (!jobDescription.trim()) return;
    
    setError(null);
    setResult(null);
    setStatus("pending");
    
    const res = await matchOpportunity(jobDescription);
    if (res.error) {
      setError(res.error);
      setStatus("failed");
      return;
    }

    setJobId(res.jobId);
  };

  return (
    <div className="bg-[#fbfcfd] border border-zinc-200/80 rounded-2xl p-6 shadow-2xs">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-2xs">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Opportunity Matcher</h2>
          <p className="text-xs text-zinc-500">Compare your AI Passport against any real job description in real-time.</p>
        </div>
      </div>

      <Textarea 
        placeholder="Paste an internship or job description here..."
        className="min-h-[100px] mb-3 bg-white border-zinc-200 text-zinc-900 focus-visible:ring-zinc-400 placeholder:text-zinc-400 text-xs resize-none"
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        disabled={status === "pending" || status === "processing"}
      />

      <Button 
        onClick={handleMatch}
        disabled={!jobDescription.trim() || status === "pending" || status === "processing"}
        className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-9 font-medium text-xs shadow-2xs cursor-pointer"
      >
        {(status === "pending" || status === "processing") ? (
          <>
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            Analyzing Match Score...
          </>
        ) : "Evaluate Match with Passport"}
      </Button>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex gap-2 text-red-700 text-xs">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {result && status === "completed" && (
        <div className="mt-5 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs">
            <span className="text-xs font-semibold text-zinc-700">Semantic Match Score</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-xl font-bold font-mono ${result.match_score > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {result.match_score}%
              </span>
            </div>
          </div>
          
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
            <h4 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Verdict
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {result.explainable_text}
            </p>
          </div>
          
          <div className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
            <h4 className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              Gap Analysis
            </h4>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {result.gap_analysis}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


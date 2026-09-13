"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Bot, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { generateCoachingInsight } from "@/actions/ai-coach";
import { MatchResult } from "@/lib/matching/opportunity-matcher";

export function AiCoachInsight({ result, passportSnapshot }: { result: MatchResult, passportSnapshot: any }) {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAskCoach = async () => {
    if (insight) {
      setIsOpen(!isOpen);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setIsOpen(true);
      const generatedInsight = await generateCoachingInsight(passportSnapshot, result.opportunity);
      setInsight(generatedInsight);
    } catch (err) {
      setError("The AI Coach is currently unavailable. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleAskCoach}
        className="w-full flex items-center justify-between text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 rounded-xl"
      >
        <span className="flex items-center gap-2 font-semibold text-xs">
          <Bot className="w-3.5 h-3.5 text-emerald-600" />
          {insight ? "View AI Strategy Insight" : "Get AI Match Analysis for this Role"}
        </span>
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          insight && (isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />)
        )}
      </Button>

      {isOpen && (
        <div className="mt-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl overflow-hidden animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="p-4 relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 text-emerald-700 space-y-2">
                <Sparkles className="w-5 h-5 animate-pulse text-emerald-600" />
                <p className="text-xs font-medium animate-pulse tracking-wide">Analyzing semantic skill match...</p>
              </div>
            ) : error ? (
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            ) : (
              <div className="prose prose-sm prose-emerald max-w-none text-zinc-700 text-xs">
                <ReactMarkdown
                  components={{
                    h1: ({node, ...props}) => <h4 className="text-xs font-bold text-zinc-900 mt-1 mb-1" {...props} />,
                    h2: ({node, ...props}) => <h5 className="text-xs font-semibold text-zinc-900 mt-2 mb-1" {...props} />,
                    h3: ({node, ...props}) => <h6 className="text-xs font-semibold text-zinc-800 mt-2 mb-1" {...props} />,
                    p: ({node, ...props}) => <p className="text-zinc-700 leading-relaxed mb-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 text-zinc-700 space-y-0.5" {...props} />,
                    li: ({node, ...props}) => <li className="text-zinc-700" {...props} />,
                    strong: ({node, ...props}) => <strong className="text-zinc-900 font-semibold" {...props} />,
                  }}
                >
                  {insight || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

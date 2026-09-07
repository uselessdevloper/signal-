"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { UserPlus, Users, AlignLeft, Flag, CheckCircle2, Sparkles, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CreateTeammatesPage() {
  const router = useRouter();
  const [teamName, setTeamName] = useState("");
  const [description, setDescription] = useState("");
  const [neededMembers, setNeededMembers] = useState("2");
  const [genderPref, setGenderPref] = useState("any");
  const [skills, setSkills] = useState("React, Next.js, Python");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast.error("Please provide a Team Name");
      return;
    }
    if (!description.trim()) {
      toast.error("Please add a short project/hackathon description");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`Team "${teamName}" posted successfully! It is now visible on the Find Team board.`);
      router.push("/dashboard/find-team");
    }, 600);
  };

  return (
    <div className="space-y-6 p-6 sm:p-10 max-w-3xl mx-auto w-full font-sans text-zinc-900 bg-white">
      <PageHeader
        title="Post a Team Requirement"
        description="Find verified teammates matching your project stack and hackathon goals."
        icon={UserPlus}
      />

      <Card className="p-6 sm:p-8 bg-[#fbfcfd] border-zinc-200/90 shadow-2xs rounded-2xl">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Team Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold font-mono text-zinc-700 flex items-center gap-2 uppercase tracking-wider">
              <Flag className="w-3.5 h-3.5 text-blue-600" />
              Team / Project Name
            </label>
            <input 
              type="text" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. NeuralFlow AI Swarm" 
              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all shadow-2xs"
            />
          </div>

          {/* Hackathon Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold font-mono text-zinc-700 flex items-center gap-2 uppercase tracking-wider">
              <AlignLeft className="w-3.5 h-3.5 text-purple-600" />
              Hackathon / Project Description
            </label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're building, the hackathon target, and what architecture or problem you're tackling..." 
              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all resize-none shadow-2xs"
            />
          </div>

          {/* Required Skills */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold font-mono text-zinc-700 flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Preferred Skills & Tech Stack (comma separated)
            </label>
            <input 
              type="text" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. Next.js 16, Python, LangGraph, Go" 
              className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-all shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Number Required */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold font-mono text-zinc-700 flex items-center gap-2 uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-sky-600" />
                Teammates Needed
              </label>
              <div className="relative">
                <select 
                  value={neededMembers}
                  onChange={(e) => setNeededMembers(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 appearance-none focus:outline-none focus:border-zinc-400 transition-all cursor-pointer shadow-2xs"
                >
                  <option value="1">1 teammate</option>
                  <option value="2">2 teammates</option>
                  <option value="3">3 teammates</option>
                  <option value="4+">4+ teammates</option>
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Gender Preference */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold font-mono text-zinc-700 flex items-center gap-2 uppercase tracking-wider">
                <UserPlus className="w-3.5 h-3.5 text-pink-600" />
                Diversity / Team Preference
              </label>
              <div className="relative">
                <select 
                  value={genderPref}
                  onChange={(e) => setGenderPref(e.target.value)}
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 appearance-none focus:outline-none focus:border-zinc-400 transition-all cursor-pointer shadow-2xs"
                >
                  <option value="any">No Preference (Open to All)</option>
                  <option value="female">Women in Tech / Female Focus</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-zinc-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-1 border-t border-zinc-200/80 flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-6 py-2.5 rounded-xl shadow-2xs flex items-center gap-2 text-xs cursor-pointer"
            >
              {isSubmitting ? (
                <span>Posting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Post Team Requirement
                </>
              )}
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
}


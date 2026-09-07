"use client";

import React, { useState } from "react";
import { Users, Search, Sparkles, Filter, Code2, Globe, Rocket, CheckCircle2, UserPlus, Trophy, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

interface TeamItem {
  id: string;
  name: string;
  hackathon: string;
  description: string;
  neededRoles: string[];
  techStack: string[];
  membersCount: number;
  maxMembers: number;
  leadName: string;
  leadAvatarInitials: string;
  deadline: string;
}

const INITIAL_TEAMS: TeamItem[] = [
  {
    id: "team-1",
    name: "NeuralFlow AI",
    hackathon: "Google Cloud GenAI Hackathon 2026",
    description: "Building autonomous agent swarm architecture for real-time code verification and GitHub provenance tracking using Gemini 2.5 Flash and Vertex AI.",
    neededRoles: ["Backend Engineer", "ML / LangGraph Specialist"],
    techStack: ["Python", "FastAPI", "LangGraph", "GCP", "Gemini 2.5"],
    membersCount: 2,
    maxMembers: 4,
    leadName: "Aarav Sharma",
    leadAvatarInitials: "AS",
    deadline: "3 days left",
  },
  {
    id: "team-2",
    name: "CyberShield Core",
    hackathon: "ETHIndia & Web3 Security Summit",
    description: "Developing cryptographic zero-knowledge skill passports with deterministic SHA256 code signature trees and anti-tamper verification.",
    neededRoles: ["Frontend Engineer (Next.js)", "Smart Contract Dev"],
    techStack: ["Next.js 16", "TypeScript", "Solidity", "TailwindCSS"],
    membersCount: 3,
    maxMembers: 4,
    leadName: "Priya Patel",
    leadAvatarInitials: "PP",
    deadline: "5 days left",
  },
  {
    id: "team-3",
    name: "HyperScale DB",
    hackathon: "HackMIT Global Sprint",
    description: "Raft consensus distributed key-value engine with vector embeddings for sub-millisecond similarity queries across multi-region clusters.",
    neededRoles: ["Systems / Go Engineer", "DevOps / K8s"],
    techStack: ["Go", "gRPC", "Docker", "Raft", "Distributed Systems"],
    membersCount: 1,
    maxMembers: 3,
    leadName: "Rohan Verma",
    leadAvatarInitials: "RV",
    deadline: "1 week left",
  },
  {
    id: "team-4",
    name: "QuantumUI Lab",
    hackathon: "Modern Web & UX Challenge",
    description: "Creating accessible, zero-latency motion design system for next-generation developer tooling and telemetry dashboards.",
    neededRoles: ["UI/UX Designer", "Design Systems Engineer"],
    techStack: ["React 19", "Framer Motion", "Tailwind CSS", "Turbopack"],
    membersCount: 2,
    maxMembers: 3,
    leadName: "Ananya Iyer",
    leadAvatarInitials: "AI",
    deadline: "4 days left",
  },
];

export default function FindTeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [requestedTeams, setRequestedTeams] = useState<Record<string, boolean>>({});

  const allTags = ["All", "Python", "Next.js 16", "Go", "LangGraph", "Gemini 2.5", "TypeScript"];

  const filteredTeams = INITIAL_TEAMS.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.hackathon.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.techStack.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag =
      selectedTag === "All" || team.techStack.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()));

    return matchesSearch && matchesTag;
  });

  const handleJoinRequest = (teamId: string, teamName: string) => {
    setRequestedTeams((prev) => ({ ...prev, [teamId]: true }));
    toast.success(`Application sent to ${teamName}! The team lead will review your verified Skill Passport.`);
  };

  return (
    <div className="w-full min-h-full flex flex-col gap-8 p-6 sm:p-10 max-w-7xl mx-auto font-sans bg-white text-zinc-900">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2 font-mono">
            <Trophy className="w-3.5 h-3.5" />
            Hackathon & Project Matchmaker
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
            Find Hackathon Teams
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-2xl mt-1">
            Browse active teams recruiting verified developers. Your GitProof™ audit and Skill Passport badges automatically boost your match rate.
          </p>
        </div>

        <Link href="/dashboard/create-teammates">
          <Button className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-4 py-2 rounded-xl flex items-center gap-2 shadow-2xs text-xs cursor-pointer">
            <UserPlus className="w-3.5 h-3.5" />
            Post Your Team
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams by hackathon, skill, or project keywords..."
            className="w-full bg-[#fbfcfd] border border-zinc-200/90 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors shadow-2xs"
          />
        </div>

        {/* Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 no-scrollbar">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? "bg-zinc-900 text-white font-semibold shadow-2xs"
                  : "bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/70 border border-zinc-200/60"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredTeams.map((team) => {
          const isRequested = requestedTeams[team.id];
          return (
            <div
              key={team.id}
              className="bg-[#fbfcfd] border border-zinc-200/90 hover:border-zinc-300 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-2xs hover:shadow-xs relative overflow-hidden group"
            >
              <div className="flex flex-col gap-2.5">
                {/* Team & Hackathon Title */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      {team.hackathon}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 tracking-tight mt-1.5">{team.name}</h3>
                  </div>

                  <span className="text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md shrink-0 font-medium">
                    {team.deadline}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed">{team.description}</p>

                {/* Needed Roles */}
                <div className="flex flex-col gap-1 pt-1">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">
                    Looking for:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {team.neededRoles.map((role) => (
                      <span
                        key={role}
                        className="text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {team.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] font-mono bg-white text-zinc-700 border border-zinc-200 px-2 py-0.2 rounded shadow-2xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer: Lead & Action */}
              <div className="flex items-center justify-between pt-3 border-t border-zinc-200/70">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-900 text-white font-mono text-xs font-bold flex items-center justify-center shadow-2xs">
                    {team.leadAvatarInitials}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-zinc-900">{team.leadName}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {team.membersCount}/{team.maxMembers} Members
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleJoinRequest(team.id, team.name)}
                  disabled={isRequested}
                  className={`text-xs font-medium px-3.5 py-1.5 rounded-xl transition-all shadow-2xs h-8 ${
                    isRequested
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-zinc-900 text-white hover:bg-zinc-800"
                  }`}
                >
                  {isRequested ? (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Applied
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Rocket className="w-3.5 h-3.5" />
                      Request to Join
                    </span>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


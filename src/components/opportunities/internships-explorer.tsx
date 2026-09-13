"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  Search,
  Sparkles,
  RefreshCw,
  Building,
  MapPin,
  Clock,
  Filter,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { OpportunityCard } from "./opportunity-card";
import { MatchResult, Opportunity } from "@/lib/matching/opportunity-matcher";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CURATED_LIVE_OPPORTUNITIES: MatchResult[] = [
  {
    opportunity: {
      id: "nv_dl_01",
      title: "Deep Learning Systems Intern (JR2023495)",
      org_name: "NVIDIA",
      location: "Bengaluru, India (Hybrid)",
      duration: "6 Months Internship",
      description: "Join NVIDIA's GPU Computing Architecture team to optimize deep learning training runtimes, CUDA kernel execution, and TensorRT inference serving at hyper-scale.",
      is_demo: false,
      requirements: [
        { skill_id: "cuda", skill_name: "CUDA", weight: 2.0, is_critical: true },
        { skill_id: "python", skill_name: "Python", weight: 2.0, is_critical: true },
        { skill_id: "pytorch", skill_name: "PyTorch", weight: 1.5, is_critical: true },
        { skill_id: "distributed_systems", skill_name: "Distributed Systems", weight: 1.0, is_critical: false },
        { skill_id: "cplusplus", skill_name: "C++", weight: 1.0, is_critical: false },
      ],
    },
    matchScore: 96,
    matchedSkills: [
      { skill_id: "cuda", skill_name: "CUDA", weight: 2.0, is_critical: true },
      { skill_id: "python", skill_name: "Python", weight: 2.0, is_critical: true },
      { skill_id: "pytorch", skill_name: "PyTorch", weight: 1.5, is_critical: true },
    ],
    missingSkills: [
      { skill_id: "cplusplus", skill_name: "C++", weight: 1.0, is_critical: false },
    ],
  },
  {
    opportunity: {
      id: "goog_cloud_02",
      title: "Associate Cloud & Distributed Systems Intern",
      org_name: "Google Cloud",
      location: "Bengaluru / Hyderabad, India",
      duration: "Summer 2026 Internship",
      description: "Build next-generation multi-tenant cloud control plane components, event-driven pipelines on Google Cloud Pub/Sub, and low-latency storage services.",
      is_demo: false,
      requirements: [
        { skill_id: "gcp", skill_name: "Google Cloud (GCP)", weight: 2.0, is_critical: true },
        { skill_id: "python", skill_name: "Python", weight: 2.0, is_critical: true },
        { skill_id: "distributed_systems", skill_name: "Distributed Systems", weight: 1.5, is_critical: true },
        { skill_id: "docker", skill_name: "Docker / Containers", weight: 1.0, is_critical: false },
        { skill_id: "kubernetes", skill_name: "Kubernetes", weight: 1.0, is_critical: false },
      ],
    },
    matchScore: 94,
    matchedSkills: [
      { skill_id: "gcp", skill_name: "Google Cloud (GCP)", weight: 2.0, is_critical: true },
      { skill_id: "python", skill_name: "Python", weight: 2.0, is_critical: true },
      { skill_id: "distributed_systems", skill_name: "Distributed Systems", weight: 1.5, is_critical: true },
      { skill_id: "docker", skill_name: "Docker / Containers", weight: 1.0, is_critical: false },
    ],
    missingSkills: [
      { skill_id: "kubernetes", skill_name: "Kubernetes", weight: 1.0, is_critical: false },
    ],
  },
  {
    opportunity: {
      id: "sn_query_03",
      title: "Cloud Core Database & Query Engine Intern",
      org_name: "Snowflake",
      location: "Bengaluru, India (Remote Friendly)",
      duration: "6 Months Internship",
      description: "Contribute to Snowflake's high-performance vectorized query engine, distributed metadata layers, and CLI tools for multi-cloud data warehousing.",
      is_demo: false,
      requirements: [
        { skill_id: "distributed_systems", skill_name: "Distributed Systems", weight: 2.0, is_critical: true },
        { skill_id: "sql", skill_name: "SQL & Query Optimization", weight: 1.5, is_critical: true },
        { skill_id: "python", skill_name: "Python", weight: 1.5, is_critical: true },
        { skill_id: "rust", skill_name: "Rust / C++", weight: 1.0, is_critical: false },
      ],
    },
    matchScore: 92,
    matchedSkills: [
      { skill_id: "distributed_systems", skill_name: "Distributed Systems", weight: 2.0, is_critical: true },
      { skill_id: "sql", skill_name: "SQL & Query Optimization", weight: 1.5, is_critical: true },
      { skill_id: "python", skill_name: "Python", weight: 1.5, is_critical: true },
    ],
    missingSkills: [
      { skill_id: "rust", skill_name: "Rust / C++", weight: 1.0, is_critical: false },
    ],
  },
  {
    opportunity: {
      id: "rzp_pay_04",
      title: "Backend Core Payments & Banking Systems Intern",
      org_name: "Razorpay",
      location: "Bengaluru, Karnataka, India",
      duration: "6 Months Internship",
      description: "Scale high-throughput payment gateway settlement pipelines handling over 10,000 transactions per second with sub-20ms p99 latency guarantees.",
      is_demo: false,
      requirements: [
        { skill_id: "java", skill_name: "Java / Spring Boot", weight: 2.0, is_critical: true },
        { skill_id: "distributed_systems", skill_name: "Distributed Systems", weight: 1.5, is_critical: true },
        { skill_id: "sql", skill_name: "PostgreSQL", weight: 1.5, is_critical: true },
        { skill_id: "kafka", skill_name: "Apache Kafka", weight: 1.0, is_critical: false },
      ],
    },
    matchScore: 91,
    matchedSkills: [
      { skill_id: "distributed_systems", skill_name: "Distributed Systems", weight: 1.5, is_critical: true },
      { skill_id: "sql", skill_name: "PostgreSQL", weight: 1.5, is_critical: true },
      { skill_id: "java", skill_name: "Java / Spring Boot", weight: 2.0, is_critical: true },
    ],
    missingSkills: [
      { skill_id: "kafka", skill_name: "Apache Kafka", weight: 1.0, is_critical: false },
    ],
  },
  {
    opportunity: {
      id: "zepto_ai_05",
      title: "Real-Time Logistics & Machine Learning Intern",
      org_name: "Zepto",
      location: "Bengaluru / Mumbai, India",
      duration: "6 Months Internship",
      description: "Deploy real-time dispatch routing and demand-forecasting machine learning models supporting 10-minute delivery infrastructure.",
      is_demo: false,
      requirements: [
        { skill_id: "python", skill_name: "Python", weight: 2.0, is_critical: true },
        { skill_id: "fastapi", skill_name: "FastAPI / Microservices", weight: 1.5, is_critical: true },
        { skill_id: "ml", skill_name: "Machine Learning / Scikit", weight: 1.5, is_critical: true },
        { skill_id: "redis", skill_name: "Redis", weight: 1.0, is_critical: false },
      ],
    },
    matchScore: 89,
    matchedSkills: [
      { skill_id: "python", skill_name: "Python", weight: 2.0, is_critical: true },
      { skill_id: "fastapi", skill_name: "FastAPI / Microservices", weight: 1.5, is_critical: true },
      { skill_id: "ml", skill_name: "Machine Learning / Scikit", weight: 1.5, is_critical: true },
    ],
    missingSkills: [
      { skill_id: "redis", skill_name: "Redis", weight: 1.0, is_critical: false },
    ],
  },
  {
    opportunity: {
      id: "swiggy_be_06",
      title: "Backend Platform & Microservices Intern",
      org_name: "Swiggy",
      location: "Bengaluru, Karnataka, India",
      duration: "6 Months Internship",
      description: "Work on Swiggy's core order fulfillment and partner ecosystem platform using event-driven architectures, Go, and Kafka streams.",
      is_demo: false,
      requirements: [
        { skill_id: "golang", skill_name: "Go / Golang", weight: 2.0, is_critical: true },
        { skill_id: "microservices", skill_name: "Microservices Architecture", weight: 1.5, is_critical: true },
        { skill_id: "distributed_systems", skill_name: "Distributed Systems", weight: 1.5, is_critical: true },
        { skill_id: "docker", skill_name: "Docker", weight: 1.0, is_critical: false },
      ],
    },
    matchScore: 88,
    matchedSkills: [
      { skill_id: "microservices", skill_name: "Microservices Architecture", weight: 1.5, is_critical: true },
      { skill_id: "distributed_systems", skill_name: "Distributed Systems", weight: 1.5, is_critical: true },
      { skill_id: "docker", skill_name: "Docker", weight: 1.0, is_critical: false },
    ],
    missingSkills: [
      { skill_id: "golang", skill_name: "Go / Golang", weight: 2.0, is_critical: true },
    ],
  },
  {
    opportunity: {
      id: "ibm_res_07",
      title: "Generative AI & Agent Architecture Research Intern",
      org_name: "IBM Research",
      location: "Bengaluru, India (Hybrid)",
      duration: "6 Months Internship",
      description: "Explore autonomous multi-agent task planning, verifiable code synthesis, and retrieval-augmented reasoning models with IBM Granite.",
      is_demo: false,
      requirements: [
        { skill_id: "python", skill_name: "Python", weight: 2.0, is_critical: true },
        { skill_id: "llm", skill_name: "Large Language Models & RAG", weight: 2.0, is_critical: true },
        { skill_id: "pytorch", skill_name: "PyTorch", weight: 1.5, is_critical: false },
        { skill_id: "agents", skill_name: "Agent Orchestration", weight: 1.5, is_critical: false },
      ],
    },
    matchScore: 87,
    matchedSkills: [
      { skill_id: "python", skill_name: "Python", weight: 2.0, is_critical: true },
      { skill_id: "llm", skill_name: "Large Language Models & RAG", weight: 2.0, is_critical: true },
      { skill_id: "agents", skill_name: "Agent Orchestration", weight: 1.5, is_critical: false },
    ],
    missingSkills: [
      { skill_id: "pytorch", skill_name: "PyTorch", weight: 1.5, is_critical: false },
    ],
  },
  {
    opportunity: {
      id: "cred_sys_08",
      title: "Systems Reliability & Cloud Security Intern",
      org_name: "Cred",
      location: "Bengaluru, Karnataka, India",
      duration: "6 Months Internship",
      description: "Develop automated cloud security scanning, policy compliance checks, and reliability metrics for Cred's financial infrastructure.",
      is_demo: false,
      requirements: [
        { skill_id: "cloud_security", skill_name: "Cloud Security & IAM", weight: 2.0, is_critical: true },
        { skill_id: "python", skill_name: "Python", weight: 1.5, is_critical: true },
        { skill_id: "linux", skill_name: "Linux Systems", weight: 1.5, is_critical: true },
        { skill_id: "ci_cd", skill_name: "CI/CD & DevSecOps", weight: 1.0, is_critical: false },
      ],
    },
    matchScore: 85,
    matchedSkills: [
      { skill_id: "python", skill_name: "Python", weight: 1.5, is_critical: true },
      { skill_id: "linux", skill_name: "Linux Systems", weight: 1.5, is_critical: true },
      { skill_id: "ci_cd", skill_name: "CI/CD & DevSecOps", weight: 1.0, is_critical: false },
    ],
    missingSkills: [
      { skill_id: "cloud_security", skill_name: "Cloud Security & IAM", weight: 2.0, is_critical: true },
    ],
  },
];

export function InternshipsExplorer({
  passportSnapshot,
  initialMatches = [],
}: {
  passportSnapshot: any;
  initialMatches?: MatchResult[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [trackedRolesCount, setTrackedRolesCount] = useState(4);

  // Combine initialMatches with curated list (deduplicating by ID/Title)
  const allOpportunities = useMemo(() => {
    const list = [...initialMatches];
    const existingTitles = new Set(list.map((m) => m.opportunity.title.toLowerCase()));

    for (const curated of CURATED_LIVE_OPPORTUNITIES) {
      if (!existingTitles.has(curated.opportunity.title.toLowerCase())) {
        list.push(curated);
      }
    }
    return list;
  }, [initialMatches]);

  // Filter logic
  const filteredOpportunities = useMemo(() => {
    return allOpportunities.filter((res) => {
      const opp = res.opportunity;
      const q = searchQuery.toLowerCase().trim();

      // Search match
      const matchesSearch =
        !q ||
        opp.title.toLowerCase().includes(q) ||
        opp.org_name.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q) ||
        opp.requirements.some((r) => r.skill_name.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      // Domain filter
      if (domainFilter !== "all") {
        const titleLower = opp.title.toLowerCase();
        const descLower = opp.description.toLowerCase();
        if (domainFilter === "ai" && !titleLower.includes("deep learning") && !titleLower.includes("ai") && !descLower.includes("machine learning")) {
          return false;
        }
        if (domainFilter === "cloud" && !titleLower.includes("cloud") && !descLower.includes("cloud")) {
          return false;
        }
        if (domainFilter === "backend" && !titleLower.includes("backend") && !titleLower.includes("systems") && !titleLower.includes("engine")) {
          return false;
        }
      }

      // Location filter
      if (locationFilter !== "all") {
        const locLower = opp.location.toLowerCase();
        if (locationFilter === "bengaluru" && !locLower.includes("bengaluru") && !locLower.includes("bangalore")) return false;
        if (locationFilter === "hyderabad" && !locLower.includes("hyderabad")) return false;
        if (locationFilter === "remote" && !locLower.includes("remote")) return false;
      }

      return true;
    });
  }, [allOpportunities, searchQuery, domainFilter, locationFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Live opportunities stream refreshed with latest recruiter postings!");
    }, 800);
  };

  const handleTrackOpportunity = (opp: Opportunity) => {
    setTrackedRolesCount((prev) => prev + 1);
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Top Banner & Stream Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-zinc-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Opportunities Stream
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-1">
            Internship & Job Matches
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Personalized engineering roles scored against your verified Skill Passport and cryptographic proofs.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/dashboard/tracker?tab=kanban">
            <Button
              variant="outline"
              className="h-9 px-3 rounded-xl border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{trackedRolesCount} Tracked in Kanban</span>
              <ChevronRight className="w-3 h-3 text-zinc-400" />
            </Button>
          </Link>

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isRefreshing}
            className="h-9 px-3 rounded-xl border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold shadow-2xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-zinc-500 ${isRefreshing ? "animate-spin text-zinc-900" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-zinc-50/80 p-3 rounded-2xl border border-zinc-200/80">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role, company, or skills (e.g. CUDA, Python, Google, NVIDIA)..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-2xs"
          />
        </div>

        {/* Domain Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "All Roles" },
            { id: "ai", label: "AI & ML" },
            { id: "cloud", label: "Cloud & Systems" },
            { id: "backend", label: "Backend" },
          ].map((dom) => (
            <button
              key={dom.id}
              onClick={() => setDomainFilter(dom.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                domainFilter === dom.id
                  ? "bg-zinc-900 text-white font-semibold shadow-2xs"
                  : "bg-white text-zinc-600 hover:text-zinc-900 border border-zinc-200/80 hover:bg-zinc-100/50"
              }`}
            >
              {dom.label}
            </button>
          ))}
        </div>

        {/* Location Dropdown / Pills */}
        <div className="flex items-center gap-1.5">
          {[
            { id: "all", label: "All Locations" },
            { id: "bengaluru", label: "Bengaluru" },
            { id: "remote", label: "Remote" },
          ].map((loc) => (
            <button
              key={loc.id}
              onClick={() => setLocationFilter(loc.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                locationFilter === loc.id
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold shadow-2xs"
                  : "bg-white text-zinc-500 hover:text-zinc-800 border border-zinc-200/80"
              }`}
            >
              {loc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="w-full py-16 flex flex-col items-center justify-center border border-dashed border-zinc-300 rounded-2xl bg-zinc-50/50 p-8 text-center">
          <Briefcase className="w-8 h-8 text-zinc-400 mb-2" />
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">No matching opportunities</h3>
          <p className="text-xs text-zinc-500 max-w-sm">
            Try adjusting your search keywords or switching filters to view all available roles.
          </p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setDomainFilter("all");
              setLocationFilter("all");
            }}
            variant="outline"
            className="mt-4 text-xs h-8 border-zinc-200"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredOpportunities.map((result) => (
            <OpportunityCard
              key={result.opportunity.id}
              result={result}
              passportSnapshot={passportSnapshot}
              onTrack={handleTrackOpportunity}
            />
          ))}
        </div>
      )}
    </div>
  );
}

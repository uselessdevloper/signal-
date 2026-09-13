"use client";

import React, { useState } from "react";
import {
  Server,
  Code2,
  Database,
  Layers,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Brain,
  Globe,
  Smartphone,
  Flame,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoleDefinition {
  id: string;
  title: string;
  category: string;
  icon: any;
  description: string;
  requiredLanguages: { name: string; importance: "Core" | "Strongly Recommended" | "Elective" }[];
  requiredFrameworks: string[];
  requiredDatabasesAndInfra: string[];
  suggestedRoadmapProjects: { title: string; tech: string; description: string }[];
}

const ROLES: RoleDefinition[] = [
  {
    id: "backend",
    title: "Backend Developer",
    category: "Server-Side & APIs",
    icon: Server,
    description:
      "Designs distributed server architectures, high-throughput REST/gRPC APIs, microservices, databases, and message streaming pipelines.",
    requiredLanguages: [
      { name: "Python", importance: "Core" },
      { name: "Go", importance: "Core" },
      { name: "TypeScript / Node.js", importance: "Core" },
      { name: "SQL (PostgreSQL / MySQL)", importance: "Core" },
      { name: "Java", importance: "Strongly Recommended" },
      { name: "Rust", importance: "Elective" },
    ],
    requiredFrameworks: ["FastAPI", "Express.js / NestJS", "Gin / Fiber", "Spring Boot", "Django"],
    requiredDatabasesAndInfra: [
      "PostgreSQL",
      "Redis (Caching & Queues)",
      "Docker & Containers",
      "gRPC / Protocol Buffers",
      "Apache Kafka / RabbitMQ",
      "Database Indexing & Sharding",
    ],
    suggestedRoadmapProjects: [
      {
        title: "High-Throughput Distributed Rate Limiter",
        tech: "Go + Redis + Token Bucket Algorithm",
        description: "Build an API rate limiter capable of handling 50k req/sec using Redis sliding windows and Go goroutines.",
      },
      {
        title: "Microservices Event-Driven Commerce Engine",
        tech: "Python FastAPI + Kafka + PostgreSQL",
        description: "Implement decoupled order, billing, and inventory services communicating via asynchronous Kafka event buses.",
      },
      {
        title: "Zero-Downtime Database Migration Tool",
        tech: "Rust / TypeScript + SQL",
        description: "Develop a CLI tool that runs transactional schema migrations with automatic rollback and deadlock detection.",
      },
    ],
  },
  {
    id: "fullstack",
    title: "Full-Stack Developer",
    category: "End-to-End Web Systems",
    icon: Globe,
    description:
      "Bridges responsive client-side user interfaces with robust server architectures, database modeling, and cloud deployments.",
    requiredLanguages: [
      { name: "TypeScript", importance: "Core" },
      { name: "JavaScript", importance: "Core" },
      { name: "Python", importance: "Strongly Recommended" },
      { name: "SQL", importance: "Core" },
      { name: "HTML5 / CSS3", importance: "Core" },
    ],
    requiredFrameworks: ["Next.js (App Router)", "React", "TailwindCSS", "Prisma / Drizzle ORM", "Node.js"],
    requiredDatabasesAndInfra: ["PostgreSQL / Supabase", "Redis", "Vercel / AWS", "Docker", "Authentication (OAuth, JWT)"],
    suggestedRoadmapProjects: [
      {
        title: "Real-Time Collaborative Document Canvas",
        tech: "Next.js + WebSockets + Redis + PostgreSQL",
        description: "Build real-time multi-user cursor sync, optimistic state updates, and CRDT collision resolution.",
      },
      {
        title: "AI-Powered SaaS Billing & Subscription Hub",
        tech: "React + TypeScript + Stripe API + Supabase",
        description: "Complete payment webhook pipeline, tiered plan metering, and automated invoice PDF generation.",
      },
    ],
  },
  {
    id: "aiml",
    title: "AI / ML Engineer",
    category: "Machine Learning & Neural Networks",
    icon: Brain,
    description:
      "Develops predictive models, neural architectures, LLM inference pipelines, vector embeddings, and data processing workflows.",
    requiredLanguages: [
      { name: "Python", importance: "Core" },
      { name: "C++", importance: "Strongly Recommended" },
      { name: "SQL", importance: "Core" },
      { name: "R", importance: "Elective" },
    ],
    requiredFrameworks: ["PyTorch", "TensorFlow", "Hugging Face Transformers", "LangChain / LlamaIndex", "Scikit-Learn"],
    requiredDatabasesAndInfra: ["Pinecone / pgvector", "CUDA & GPU Kernels", "MLflow / Weights & Biases", "ONNX Runtime"],
    suggestedRoadmapProjects: [
      {
        title: "RAG Knowledge Retrieval & Vector Search Agent",
        tech: "Python + pgvector + Gemini/OpenAI API + FastAPI",
        description: "Hybrid keyword + semantic embedding search with reranking and context-aware citation generation.",
      },
      {
        title: "Fine-Tuned Domain Specific Code Assistant",
        tech: "PyTorch + LoRA + Hugging Face",
        description: "Fine-tune a lightweight model on code ASTs to generate verified syntax AST representations.",
      },
    ],
  },
  {
    id: "devops",
    title: "DevOps & Cloud Architect",
    category: "Infrastructure & CI/CD",
    icon: Cpu,
    description:
      "Automates deployment pipelines, cloud provisioning (IaC), container orchestration, and real-time observability telemetry.",
    requiredLanguages: [
      { name: "Go", importance: "Core" },
      { name: "Python", importance: "Core" },
      { name: "Bash / Shell", importance: "Core" },
      { name: "HCL (Terraform)", importance: "Core" },
    ],
    requiredFrameworks: ["Terraform", "Kubernetes (K8s)", "Docker", "GitHub Actions / GitLab CI", "Ansible"],
    requiredDatabasesAndInfra: ["AWS / GCP", "Prometheus & Grafana", "Helm", "ArgoCD", "OpenTelemetry"],
    suggestedRoadmapProjects: [
      {
        title: "GitOps Automated Kubernetes Deployment Pipeline",
        tech: "ArgoCD + Helm + GitHub Actions + Kube-Prometheus",
        description: "Declarative cluster syncing with automated canary rollouts and instant metric rollback triggers.",
      },
    ],
  },
];

interface Props {
  userLanguages?: string[];
  userReposCount?: number;
  className?: string;
}

export function RoleCompetencyAnalyzer({
  userLanguages = ["TypeScript", "Python", "Go", "Next.js", "SQL"],
  userReposCount = 14,
  className,
}: Props) {
  const [selectedRoleId, setSelectedRoleId] = useState("backend");
  const [customGoal, setCustomGoal] = useState("");

  const activeRole = ROLES.find((r) => r.id === selectedRoleId) || ROLES[0];

  // Calculate Match Percentage
  const normalizedUserLangs = userLanguages.map((l) => l.toLowerCase());
  const requiredLangs = activeRole.requiredLanguages;
  const matchedLangs = requiredLangs.filter((req) =>
    normalizedUserLangs.some((ul) => ul.includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(ul))
  );
  const missingLangs = requiredLangs.filter(
    (req) => !normalizedUserLangs.some((ul) => ul.includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(ul))
  );

  const matchPercent = Math.min(
    Math.round((matchedLangs.length / Math.max(requiredLangs.length, 1)) * 85 + (userReposCount > 5 ? 15 : 5)),
    100
  );

  return (
    <div
      className={cn(
        "w-full bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 text-zinc-900 font-sans shadow-sm space-y-8",
        className
      )}
    >
      <div className="space-y-8 animate-fade-in text-zinc-900">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Target Role Intelligence & Stack Mapping
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2">
              Career Competency & Language Requirements
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-xl mt-1">
              See all mandatory languages, databases, and microservice architectures required for your goal, matched against your scanned repositories.
            </p>
          </div>

          {/* Role Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = r.id === selectedRoleId;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoleId(r.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                    isSelected
                      ? "bg-white text-zinc-900 shadow-2xs"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50"
                  )}
                >
                  <Icon className="w-4 h-4 text-zinc-600" />
                  {r.title}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Role Summary & Match Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Role Description & Language Matrix */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                    <activeRole.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">{activeRole.title}</h3>
                    <span className="text-xs text-zinc-500">{activeRole.category}</span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700">
                  {matchPercent}% Role Fit
                </span>
              </div>

              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{activeRole.description}</p>
            </div>

            {/* Programming Languages Breakdown (Core / Required) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" />
                Programming Languages Required for {activeRole.title}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeRole.requiredLanguages.map((lang, idx) => {
                  const isMatched = matchedLangs.some((m) => m.name === lang.name);

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "p-3.5 rounded-xl border flex items-center justify-between transition-all shadow-2xs",
                        isMatched
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-zinc-50/60 border-zinc-200"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {isMatched ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        )}
                        <div>
                          <span className="text-sm font-bold text-zinc-900 block">{lang.name}</span>
                          <span className="text-[10px] text-zinc-500 font-medium">{lang.importance}</span>
                        </div>
                      </div>

                      <span
                        className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono",
                          isMatched
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        )}
                      >
                        {isMatched ? "VERIFIED IN REPOS" : "MISSING SKILL"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Databases, Frameworks & Infrastructure */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                Databases, Frameworks & Infrastructure
              </h4>

              <div className="flex flex-wrap gap-2">
                {activeRole.requiredDatabasesAndInfra.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-800 font-medium flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    {item}
                  </span>
                ))}

                {activeRole.requiredFrameworks.map((fw, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-800 font-medium flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {fw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Curated Project Roadmap to Bridge Missing Skills */}
          <div className="space-y-4 bg-white border border-zinc-200/80 rounded-2xl p-5 flex flex-col justify-between shadow-2xs">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-700 uppercase">
                <Flame className="w-4 h-4 text-amber-500" />
                Bridge Missing Skills (Tailored Projects)
              </div>

              <p className="text-xs text-zinc-500">
                Build these targeted production architectures to demonstrate the remaining required {activeRole.title} languages in your passport:
              </p>

              <div className="space-y-2.5 mt-2">
                {activeRole.suggestedRoadmapProjects.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-zinc-300 transition-colors space-y-1.5 group shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-zinc-900 group-hover:text-blue-700 transition-colors">
                        {proj.title}
                      </h5>
                    </div>
                    <span className="text-[10px] font-mono text-blue-700 block font-semibold">
                      {proj.tech}
                    </span>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center justify-between mt-4">
              <span className="font-semibold">All projects sync to GitProof</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

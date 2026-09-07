"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Target, 
  ChevronDown, 
  FileBadge, 
  ShieldCheck, 
  CircleDashed,
  Code2,
  Database,
  Terminal,
  Server,
  Code,
  Brain,
  Cloud,
  PenTool,
  Boxes
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CertificateUploader } from "@/components/certificates/certificate-uploader";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="none"
    className={className}
  >
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

// --- Types ---

export type SkillPassportData = {
  name: string;
  gender: string;
  careerGoal: string;
  profileImage: string;
  verifiedSkills: {
    name: string;
    confidence: "High" | "Medium" | "Low";
    iconName?: string;
  }[];
  githubRepos: number;
  certificates: number;
  verifiedSkillsCount: number;
  missingSkills: number;
  missingSkillsAnalysis: {
    description: string;
    recommendedTechStack: string[];
    suggestedProjects?: { name: string, description: string }[];
  };
  githubHeatmap: number[][];
  evidence: {
    githubRepos: { name: string; url: string; language: string; stars: number }[];
    certificates: { name: string; issuer: string; url: string }[];
  };
};

const DUMMY_DATA: SkillPassportData = {
  name: "Jane Doe",
  gender: "Female",
  careerGoal: "Full Stack Developer",
  profileImage: "https://github.com/shadcn.png", // Fallback if no avatar provided
  verifiedSkills: [
    { name: "JavaScript", confidence: "High", iconName: "javascript" },
    { name: "TypeScript", confidence: "High", iconName: "typescript" },
    { name: "Tailwind CSS", confidence: "High", iconName: "tailwindcss" },
    { name: "React", confidence: "High", iconName: "react" },
    { name: "Node.js", confidence: "Medium", iconName: "nodejs" },
  ],
  githubRepos: 14,
  certificates: 3,
  verifiedSkillsCount: 12,
  missingSkills: 2,
  missingSkillsAnalysis: {
    description: "You have strong frontend skills, but lack backend frameworks and database experience for Full Stack Development.",
    recommendedTechStack: ["PostgreSQL", "Go", "Docker", "GraphQL"]
  },
  githubHeatmap: Array(7).fill(0).map((_, r) => Array(52).fill(0).map((_, c) => (r * 7 + c * 13) % 5)),
  evidence: {
    githubRepos: [
      { name: "nextjs-ecommerce", url: "#", language: "TypeScript", stars: 142 },
      { name: "go-microservices", url: "#", language: "Go", stars: 84 },
    ],
    certificates: [
      { name: "AWS Certified Developer", issuer: "Amazon", url: "#" },
    ]
  }
};

// --- Subcomponents ---

// Simple mapping from name to a Lucide icon just for the visual layout
const getIconForSkill = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("react") || n.includes("vue") || n.includes("angular")) return <Code2 className="w-5 h-5 text-white" />;
  if (n.includes("type") || n.includes("script") || n.includes("html") || n.includes("css")) return <Code className="w-5 h-5 text-white" />;
  if (n.includes("node") || n.includes("backend") || n.includes("api")) return <Server className="w-5 h-5 text-white" />;
  if (n.includes("sql") || n.includes("data") || n.includes("mongo") || n.includes("postgres")) return <Database className="w-5 h-5 text-white" />;
  if (n.includes("ai") || n.includes("machine learning") || n.includes("python")) return <Brain className="w-5 h-5 text-white" />;
  if (n.includes("cloud") || n.includes("aws") || n.includes("azure") || n.includes("gcp") || n.includes("docker")) return <Cloud className="w-5 h-5 text-white" />;
  if (n.includes("design") || n.includes("figma") || n.includes("ui") || n.includes("ux")) return <PenTool className="w-5 h-5 text-white" />;
  if (n.includes("git") || n.includes("version")) return <Boxes className="w-5 h-5 text-white" />;
  return <Terminal className="w-5 h-5 text-white" />;
};

const SectionDivider = () => (
  <div className="h-px w-full bg-white/[0.06] my-6" />
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[11px] font-medium tracking-wider text-white/50 uppercase mb-4">
    {children}
  </h3>
);

// --- Main Component ---

export function SkillPassportCard({ data = DUMMY_DATA }: { data?: SkillPassportData }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Calculate confidence counts
  const highCount = data.verifiedSkills.filter(s => s.confidence === "High").length;
  const mediumCount = data.verifiedSkills.filter(s => s.confidence === "Medium").length;
  const lowCount = data.verifiedSkills.filter(s => s.confidence === "Low").length;

  const initials = data.name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[600px] mx-auto bg-[#050505] rounded-[28px] border border-white/[0.12] overflow-hidden relative shadow-2xl"
    >
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      <div className="relative z-10 p-4 md:p-6 pb-2">
        
        {/* SECTION 1: HEADER */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
          
          {/* Avatar Container with concentric rings */}
          <div className="relative w-[100px] h-[100px] flex items-center justify-center flex-shrink-0">
            <div className="absolute inset-0 border border-white/[0.04] rounded-full" />
            <div className="absolute inset-2 border border-white/[0.06] rounded-full" />
            <div className="absolute inset-4 border border-white/[0.08] rounded-full" />
            <div className="w-[72px] h-[72px] rounded-full bg-[#111] border border-white/[0.15] overflow-hidden relative z-10 flex items-center justify-center">
              {imgError || !data.profileImage ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 text-white font-mono font-bold text-lg">
                  {initials}
                </div>
              ) : (
                <img
                  src={data.profileImage}
                  alt={data.name}
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex flex-col justify-center h-full pt-1 md:pt-2 space-y-2 text-center md:text-left">
            <div>
              <h1 className="text-[24px] font-bold text-white leading-tight tracking-tight">
                {data.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-1.5 text-white/65 mt-0.5">
                <User className="w-3 h-3" />
                <span className="text-[11px]">{data.gender}</span>
              </div>
            </div>

            <div className="inline-flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/[0.08] rounded-lg p-2 pr-6 mt-1 relative overflow-hidden group w-fit">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
              <div className="flex items-center gap-1.5 mb-0.5">
                <Target className="w-3 h-3 text-white/40" />
                <span className="text-[9px] text-white/50 uppercase tracking-widest font-medium">Career Goal</span>
              </div>
              <span className="text-[13px] text-white font-medium pl-5">{data.careerGoal}</span>
            </div>
          </div>
        </div>

        <SectionDivider />

        {/* SECTION 2: SKILLS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Verified Skills */}
          <div>
            <SectionTitle>Verified Skills</SectionTitle>
            <div className="flex flex-col gap-1.5">
              {data.verifiedSkills.map((skill, idx) => (
                <motion.div 
                  key={skill.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className="flex items-center justify-between group bg-white/[0.01] hover:bg-white/[0.03] p-1.5 rounded-xl border border-transparent hover:border-white/[0.05] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[8px] bg-white/[0.03] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
                      <div className="scale-75 origin-center">{getIconForSkill(skill.name)}</div>
                    </div>
                    <span className="text-white font-medium text-[12px]">{skill.name}</span>
                  </div>
                  
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                    skill.confidence === "High" ? "border-white/80 text-white" :
                    skill.confidence === "Medium" ? "border-white/30 text-white/70" :
                    "border-white/10 text-white/40"
                  )}>
                    {skill.confidence}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Column: Evidence Summary */}
          <div className="flex flex-col">
            <SectionTitle>Evidence Summary</SectionTitle>
            <div className="flex flex-col gap-3">
              
              <motion.div whileHover={{ y: -4 }} className="bg-[#111] rounded-[12px] border border-white/[0.08] p-3 flex items-center gap-3 group transition-colors hover:border-white/[0.15]">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-colors group-hover:bg-white/10">
                  <GithubIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-tight">{data.githubRepos}</div>
                  <div className="text-[10px] text-white/50">GitHub Repos</div>
                </div>
              </motion.div>

              <CertificateUploader>
                <motion.button whileHover={{ y: -4 }} className="w-full text-left bg-[#111] cursor-pointer rounded-[12px] border border-white/[0.08] p-3 flex items-center gap-3 group transition-colors hover:border-white/[0.15]">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-colors group-hover:bg-white/10">
                    <FileBadge className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-white leading-tight">{data.certificates}</div>
                    <div className="text-[10px] text-white/50">Certificates (Click to Upload)</div>
                  </div>
                </motion.button>
              </CertificateUploader>

              <motion.div whileHover={{ y: -4 }} className="bg-[#111] rounded-[12px] border border-white/[0.08] p-3 flex items-center gap-3 group transition-colors hover:border-white/[0.15]">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-colors group-hover:bg-white/10">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white leading-tight">{data.verifiedSkillsCount}</div>
                  <div className="text-[10px] text-white/50">Skills Verified</div>
                </div>
              </motion.div>

            </div>
          </div>

        </div>

        <SectionDivider />



        {/* SECTION 3: GITHUB ACTIVITY */}
        <SectionTitle>GitHub Activity</SectionTitle>
        <div className="w-full flex flex-col gap-1 mt-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          <div className="flex gap-1 min-w-max">
            {/* Row Labels */}
            <div className="flex flex-col justify-between text-[9px] text-white/40 pr-2 pb-[14px]">
              <span className="mt-2">Mon</span>
              <span>Wed</span>
              <span className="mb-2">Fri</span>
            </div>

            <div className="flex flex-col gap-[3px]">
              {/* Months Row */}
              <div className="flex text-[9px] text-white/40 mb-1 pl-1">
                {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"].map((month, i) => (
                  <div key={i} className="flex-1 min-w-[21px]">{month}</div>
                ))}
              </div>

              {/* Grid */}
              {data.githubHeatmap.map((row, rowIndex) => (
                <div key={`row-${rowIndex}`} className="flex gap-[3px]">
                  {row.map((intensity, colIndex) => (
                    <div 
                      key={`cell-${rowIndex}-${colIndex}`} 
                      className={cn(
                        "w-2.5 h-2.5 rounded-[3px] flex-shrink-0 transition-colors hover:border hover:border-white/50",
                        intensity === 0 ? "bg-white/[0.04]" :
                        intensity === 1 ? "bg-white/[0.25]" :
                        intensity === 2 ? "bg-white/[0.50]" :
                        intensity === 3 ? "bg-white/[0.75]" :
                        "bg-white"
                      )}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-white/40 mt-3 min-w-max pl-8 pr-2">
            <span>Learned consistency. Built momentum.</span>
            <div className="flex items-center gap-1.5 text-[10px] text-white/40">
              <span>Less</span>
              <div className="flex gap-[3px]">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className={cn(
                    "w-2.5 h-2.5 rounded-[3px]",
                    i === 0 ? "bg-white/[0.04]" :
                    i === 1 ? "bg-white/[0.25]" :
                    i === 2 ? "bg-white/[0.50]" :
                    i === 3 ? "bg-white/[0.75]" : "bg-white"
                  )} />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>



      </div>

      {/* SECTION 5: EVIDENCE DRAWER */}
      <div className="border-t border-white/[0.08]">
        <button 
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="w-full flex items-center justify-between p-4 md:px-8 text-white/50 hover:bg-white/[0.02] hover:text-white transition-colors"
        >
          <span className="text-[11px] font-medium tracking-wider uppercase">Evidence Sources</span>
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", drawerOpen && "rotate-180")} />
        </button>

        <AnimatePresence>
          {drawerOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[#0a0a0a]"
            >
              <div className="p-4 md:px-8 md:pb-8 space-y-6">
                
                {/* GitHub Evidence List */}
                <div>
                  <h4 className="text-white text-[13px] font-medium mb-3 flex items-center gap-2">
                    <GithubIcon className="w-3.5 h-3.5" /> GitHub Evidence
                  </h4>
                  <div className="space-y-2">
                    {data.evidence.githubRepos.length > 0 ? (
                      data.evidence.githubRepos.map((repo, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                          <div className="flex flex-col">
                            <span className="text-white text-[13px] font-medium">{repo.name}</span>
                            <span className="text-[11px] text-white/40">{repo.language}</span>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="text-white text-[12px]">{repo.stars} stars</span>
                            <a href={repo.url} target="_blank" rel="noreferrer" className="block text-[11px] text-white/50 hover:text-white transition-colors hover:underline">View Repository</a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/40 text-[12px] text-center">
                        No GitHub evidence available.
                      </div>
                    )}
                  </div>
                </div>

                {/* Certificates List */}
                <div>
                  <h4 className="text-white text-[13px] font-medium mb-3 flex items-center gap-2">
                    <FileBadge className="w-3.5 h-3.5" /> Certificate Evidence
                  </h4>
                  <div className="space-y-2">
                    {data.evidence.certificates.length > 0 ? (
                      data.evidence.certificates.map((cert, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                          <div className="flex flex-col">
                            <span className="text-white text-[13px] font-medium">{cert.name}</span>
                            <span className="text-[11px] text-white/40">Issued by {cert.issuer}</span>
                          </div>
                          <a href={cert.url} target="_blank" rel="noreferrer" className="text-[11px] text-white/50 hover:text-white transition-colors hover:underline">Verify Credential</a>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] text-white/40 text-[12px] text-center">
                        No certificates uploaded.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </motion.div>
  );
}

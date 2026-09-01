"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import {
  Shield,
  GitBranch,
  Upload,
  Sparkles,
  Search,
  Map,
  ArrowRight,
  Play,
  FileCheck,
  Target,
  Share2,
  Compass,
  Zap,
  Star,
  ChevronRight,
  ExternalLink,
  Award,
  TrendingUp,
  Brain,
  AlertCircle,
  BarChart3,
  Users,
  FileBadge,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function CustomSplitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 6H8a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h1" />
      <path d="M15 6h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-1" />
      <path d="M12 10v4" />
    </svg>
  );
}

function CustomUsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="7" r="3" />
      <path d="M4 14v-1a3 3 0 0 1 3-3h2" />
      <circle cx="16" cy="7" r="3" />
      <path d="M20 14v-1a3 3 0 0 0-3-3h-2" />
      <circle cx="12" cy="14" r="3" />
      <path d="M8 21v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1" />
    </svg>
  );
}

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarButtonDemo } from "@/components/ui/star-button-demo";
import { cn } from "@/lib/utils";
import { ShimmerText } from "@/components/ui/shimmer-text";
import { Highlighter } from "@/components/ui/highlighter";
import { StackedFeatureCards } from "@/components/unlumen-ui/stacked-feature-cards";
import SlicedText from "@/components/ui/sliced-text";
import Marquee from "@/components/animata/container/marquee";

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0 bg-[url('/bg-image.png')] bg-cover bg-center bg-no-repeat"
      />
      {/* Subtle overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-black/10" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Spacer to push content down and vertically center the text better */}
        <div className="h-[100px] sm:h-[140px]" />

        {/* Headline */}
        <h1 className="flex flex-col items-center justify-center font-bold tracking-tight leading-[1.1] animate-fade-in-up">
          <span className="text-3xl sm:text-4xl md:text-5xl text-white mb-2 font-medium tracking-normal">
            Autonomous Multi-Agent
          </span>
          <ShimmerText text="Career Intelligence." className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl pb-2" />
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-white max-w-3xl mx-auto leading-relaxed animate-fade-in-up [animation-delay:150ms]">
          Suppose you are a student ready for your career, but lost in the noise unsure, overwhelmed by application tracking, and facing silent ATS resume rejections. Don&apos;t worry — Signal is here for you.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up [animation-delay:300ms]">
          <Link href="/dashboard/tracker" className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-lg">
            <Zap className="w-4 h-4 text-black" />
            Launch Multi-Agent Command Center
          </Link>
          <Link href="/dashboard" className="px-6 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-semibold hover:bg-zinc-800 transition-all flex items-center gap-2">
            View Skill Passport
          </Link>
        </div>

        {/* Hero visual — floating passport preview */}
        <div className="mt-20 animate-fade-in-up [animation-delay:600ms] relative max-w-4xl mx-auto">
          {/* Applying a mask-image to create a soft fade on the edges so it blends into the background */}
          <div className="relative mx-auto max-w-4xl [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)]">
            <img src="/sample.png" alt="Signal Multi-Agent & Skill Passport Preview" className="w-full h-auto block opacity-90" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  const heroCard = {
    title: (
      <span className="inline-flex items-center gap-2 flex-wrap">
        <span>Lost</span>
        <SlicedText text="in the noise" className="text-muted-foreground" splitSpacing={2} />
        <span>& ATS rejections?</span>
      </span>
    ),
    description: "Suppose you are a student ready for your career, but overwhelmed by manual tracking and silent ATS drops. Here is how Signal solves it.",
  };

  const featureCards = [
    {
      value: "01",
      title: "Scattered Achievements",
      description: "Your skills are spread across GitHub repos, certificates, courses, and side projects with no unified view.",
      icon: AlertCircle,
      cardClassName: "bg-zinc-900 text-zinc-50 border-zinc-800",
      iconClassName: "bg-zinc-800 text-zinc-300",
      rotateClassName: "rotate-[-1deg]",
    },
    {
      value: "02",
      title: "Unverified Skills",
      description: "Listing 'React' on your resume means nothing without proof. Recruiters have no way to validate claims.",
      icon: Search,
      cardClassName: "bg-zinc-900 text-zinc-50 border-zinc-800",
      iconClassName: "bg-zinc-800 text-zinc-300",
      rotateClassName: "rotate-[1deg]",
    },
    {
      value: "03",
      title: "No Career Roadmap",
      description: "You know where you want to go, but you don't know what skills you're missing to get there.",
      icon: Compass,
      cardClassName: "bg-zinc-900 text-zinc-50 border-zinc-800",
      iconClassName: "bg-zinc-800 text-zinc-300",
      rotateClassName: "rotate-[-1.5deg]",
    },
    {
      value: "04",
      title: "Difficult Skill Discovery",
      description: "You have skills you don't even know about, hidden in your GitHub activity and project work.",
      icon: Brain,
      cardClassName: "bg-zinc-900 text-zinc-50 border-zinc-800",
      iconClassName: "bg-zinc-800 text-zinc-300",
      rotateClassName: "rotate-[0.5deg]",
    },
    {
      value: "05",
      title: "Wrong Teammates, Wrong Outcomes",
      description: "Great ideas often fail because teams are formed through connections instead of capability and expertise.",
      icon: Users,
      cardClassName: "bg-zinc-900 text-zinc-50 border-zinc-800",
      iconClassName: "bg-zinc-800 text-zinc-300",
      rotateClassName: "rotate-[-0.5deg]",
    },
  ];

  return (
    <StackedFeatureCards
      heroCard={heroCard}
      featureCards={featureCards}
    />
  );
}

function HowItWorksSection() {
  const lineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start center", "end center"],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const lineHeight = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  const steps = [
    {
      step: "01",
      icon: GitBranch,
      title: "Connect GitHub",
      description: "Link your GitHub account and we'll analyze your repositories, languages, and commit history.",
      color: "from-zinc-700 to-zinc-900",
    },
    {
      step: "02",
      icon: Upload,
      title: "Upload Certificates",
      description: "Add your course completions, certifications, and credentials. We extract skills automatically.",
      color: "from-zinc-700 to-zinc-900",
    },
    {
      step: "03",
      icon: Shield,
      title: "Generate Skill Passport",
      description: "AI analyzes all your evidence and creates a comprehensive, verified skill passport.",
      color: "from-zinc-700 to-zinc-900",
    },
    {
      step: "04",
      icon: Target,
      title: "Discover Skill Gaps",
      description: "Compare your current skills against your dream role and see exactly what's missing.",
      color: "from-zinc-700 to-zinc-900",
    },
    {
      step: "05",
      icon: Map,
      title: "Get Career Roadmap",
      description: "Receive a personalized learning path with curated resources to close your skill gaps.",
      color: "from-zinc-700 to-zinc-900",
    },
    {
      step: "06",
      icon: Users,
      title: "Team Up With Confidence",
      description: "Explore verified skill profiles and discover teammates who bring the expertise your next project needs.",
      color: "from-zinc-700 to-zinc-900",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 sm:py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            From code to <span className="text-zinc-300">career</span> in 6 steps
          </h2>
        </div>

        <div className="relative" ref={lineRef}>
          {/* Faded background line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border/40 hidden lg:block" />

          {/* Animated active line */}
          <motion.div
            className="absolute left-[calc(50%-0.5px)] top-0 bottom-0 w-[2px] bg-zinc-300 hidden lg:block shadow-[0_0_15px_rgba(255,255,255,0.4)] z-0"
            style={{ height: lineHeight, originY: 0 }}
          />

          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, i) => (
              <div
                key={step.step}
                className={cn(
                  "relative lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center",
                  i > 0 && "lg:mt-32"
                )}
              >
                {/* Timeline dot (Fixed in place) */}
                <div className="absolute left-1/2 -translate-x-1/2 hidden lg:flex items-center justify-center z-10">
                  <div className="h-12 w-12 rounded-full border-2 border-zinc-800 bg-background flex items-center justify-center transition-colors duration-500">
                    <span className="text-xs font-bold text-zinc-300">
                      {step.step === "01" ? <GithubIcon className="h-5 w-5" /> : step.step === "02" ? <FileBadge className="h-5 w-5" /> : step.step === "03" ? <CreditCard className="h-5 w-5" /> : step.step === "04" ? <CustomSplitIcon className="h-5 w-5" /> : step.step === "05" ? <TrendingUp className="h-5 w-5" /> : step.step === "06" ? <CustomUsersIcon className="h-5 w-5" /> : step.step}
                    </span>
                  </div>
                </div>

                {/* Content (Animated) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "10000px 0px -50% 0px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={cn(
                    "lg:pr-16",
                    i % 2 === 1 && "lg:col-start-2 lg:pl-16 lg:pr-0"
                  )}
                >
                  <div className="flex items-start gap-4 lg:gap-0">
                    {/* Mobile step indicator */}
                    <div className="lg:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-zinc-300 text-sm font-bold">
                      {step.step === "01" ? <GithubIcon className="h-4 w-4" /> : step.step === "02" ? <FileBadge className="h-4 w-4" /> : step.step === "03" ? <CreditCard className="h-4 w-4" /> : step.step === "04" ? <CustomSplitIcon className="h-4 w-4" /> : step.step === "05" ? <TrendingUp className="h-4 w-4" /> : step.step === "06" ? <CustomUsersIcon className="h-4 w-4" /> : step.step}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed max-w-md">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



function FeaturesSection() {
  const features = [
    {
      title: "Skill Passport",
      description:
        "A comprehensive, shareable document that showcases your verified skills with evidence from real projects.",
    },
    {
      title: "Evidence Engine",
      description:
        "Our AI scans your GitHub repos, analyzes commit patterns, parses certificates, and cross-references everything.",
    },
    {
      title: "Skill Gap Analysis",
      description:
        "See how your current skills stack up against your target role. Know exactly what to learn next.",
    },
    {
      title: "Career Roadmap",
      description:
        "Get a personalized, milestone-based learning path with curated courses, tutorials, and project ideas.",
    },
    {
      title: "Shareable Profile",
      description:
        "Generate a public link and QR code for your passport. Share it on your resume, LinkedIn, or portfolio.",
    },
    {
      title: "Skill-Based Team Matching",
      description:
        "Move beyond guesswork and find teammates through verified skills, proven work, and shared ambitions.",
    },
  ];

  return (
    <section id="features" className="pt-24 sm:pt-32 pb-24 sm:pb-40 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <Highlighter action="underline" color="#FF9800">
              Everything you need
            </Highlighter>{" "}
            to{" "}
            <Highlighter action="highlight" color="#87CEFA">
              prove your skills
            </Highlighter>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Signal combines multi-agent orchestration, evidence aggregation, and career intelligence
            into one synchronized platform.
          </p>
        </div>

        {/* Feature Marquee */}
        <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <Marquee pauseOnHover={true} className="[--duration:40s]">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className={cn(
                  "group relative w-80 sm:w-96 shrink-0 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-border/80 transition-all duration-300 overflow-hidden"
                )}
              >
                <div className="relative">
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

function DemoPreviewSection() {
  return (
    <section id="preview" className="py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-primary/3 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-xs">
            Preview
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            See your passport in action
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Here&apos;s what a Signal Skill Passport looks like — backed by real evidence from
            your GitHub repos and certificates.
          </p>
        </div>

        {/* Full passport mock */}
        <div className="relative mx-auto max-w-5xl">
          <div className="absolute -inset-6 rounded-3xl bg-gradient-to-b from-primary/15 via-primary/5 to-transparent blur-2xl" />
          <div className="relative rounded-2xl border border-border/50 bg-card/90 backdrop-blur-sm shadow-2xl overflow-hidden">
            <FullPassportPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

/* Full passport preview component */
function FullPassportPreview() {
  const skills = [
    { name: "React", level: 92, evidence: 8, status: "verified", color: "bg-blue-500" },
    { name: "TypeScript", level: 87, evidence: 6, status: "verified", color: "bg-blue-600" },
    { name: "Node.js", level: 78, evidence: 5, status: "verified", color: "bg-emerald-500" },
    { name: "PostgreSQL", level: 65, evidence: 3, status: "verified", color: "bg-violet-500" },
    { name: "Docker", level: 42, evidence: 2, status: "learning", color: "bg-cyan-500" },
    { name: "AWS", level: 28, evidence: 1, status: "gap", color: "bg-amber-500" },
  ];

  return (
    <div className="divide-y divide-border/50">
      {/* Header */}
      <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary via-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            AK
          </div>
          <div>
            <h3 className="text-xl font-bold">Aman Kumar</h3>
            <p className="text-sm text-muted-foreground">
              Aspiring Full Stack Developer · 3rd Year CSE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            12 Verified Skills
          </Badge>
          <Badge variant="outline" className="gap-1">
            <ExternalLink className="h-3 w-3" />
            Share
          </Badge>
        </div>
      </div>

      {/* Skills */}
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Skill Assessment
          </h4>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-emerald-400" /> Verified
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-amber-400" /> Learning
            </span>
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-red-400/60" /> Gap
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {skills.map((skill) => (
            <div key={skill.name} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {skill.evidence} evidence{skill.evidence !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {skill.level}%
                  </span>
                  {skill.status === "verified" && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  {skill.status === "learning" && (
                    <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                  )}
                  {skill.status === "gap" && (
                    <AlertCircle className="h-3.5 w-3.5 text-red-400/60" />
                  )}
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    skill.color
                  )}
                  style={{ width: `${skill.level}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence footer */}
      <div className="p-6 sm:p-8 bg-muted/20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "GitHub Repos", value: "14", icon: GitBranch },
            { label: "Certificates", value: "3", icon: Award },
            { label: "Skills Found", value: "18", icon: Sparkles },
            { label: "Evidence Items", value: "47", icon: FileCheck },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-4 w-4 mx-auto text-muted-foreground mb-1" />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "3rd Year CS, IIT Delhi",
      text: "Signal showed me I had 12 verified skills with proof badges I didn't even list on my resume. The passport and outreach agent got me shortlisted at 3 startups within a week.",
      avatar: "PS",
      color: "bg-pink-500",
    },
    {
      name: "Arjun Mehta",
      role: "Final Year, NIT Trichy",
      text: "The semantic gap analysis was eye-opening. The Career Optimization Agent detected my missing DevOps skills and gave me an actionable roadmap to pass ATS filters.",
      avatar: "AM",
      color: "bg-blue-500",
    },
    {
      name: "Sara Khan",
      role: "Fresher, Bangalore",
      text: "Instead of sending a generic resume, I share my Signal passport and live Kanban link. Recruiters can verify real proof of my React and Python work.",
      avatar: "SK",
      color: "bg-violet-500",
    },
  ];

  return (
    <section id="testimonials" className="py-24 sm:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-xs">
            Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Loved by <span className="gradient-text">students</span> everywhere
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            See how students are using Signal to land internships and build credible profiles.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 hover:border-border/80 transition-all duration-300"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center text-white text-xs font-bold",
                    t.color
                  )}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════
   PAGE COMPONENT — Assembles all sections
   ═══════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
    </>
  );
}

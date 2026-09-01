"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, GitBranch, CheckCircle2, ShieldCheck, Star, Code2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { syncGitHub, analyzeGitHubRealtime } from "@/actions/github";
import { RealtimeScanModal } from "@/components/github/realtime-scan-modal";

const formSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters."),
  college_name: z.string().min(2, "College name must be at least 2 characters."),
  degree: z.string().min(2, "Degree must be at least 2 characters."),
  graduation_year: z.string().regex(/^\d{4}$/, "Must be a valid 4-digit year."),
  gender: z.string().min(1, "Please select your gender."),
  career_goal: z.string().min(2, "Career goal must be at least 2 characters."),
  github_username: z.string().optional(),
});

export function UnifiedOnboardingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [analyzingGithub, setAnalyzingGithub] = useState(false);
  const [githubResult, setGithubResult] = useState<any>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      college_name: "",
      degree: "",
      graduation_year: "",
      gender: "",
      career_goal: "",
      github_username: "",
    },
  });

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const handleNextStep = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isValid = await form.trigger([
      "full_name",
      "college_name",
      "degree",
      "graduation_year",
      "gender",
      "career_goal",
    ]);
    if (isValid) {
      setStep(2);
    }
  };

  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);


  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [authLogin, setAuthLogin] = useState<string>("developer");

  const handleOAuthConnect = () => {
    setGithubError(null);
    setIsConnecting(true);
    setSyncStatus("Waiting for GitHub authorization in popup...");

    const width = 600;
    const height = 750;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "/api/auth/github",
      "Signal_GitHub_Auth",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    const messageHandler = async (event: MessageEvent) => {
      if (event.data?.type === "GITHUB_AUTH_SUCCESS") {
        window.removeEventListener("message", messageHandler);
        setAuthLogin(event.data.login || "developer");
        setIsScanModalOpen(true);
        setSyncStatus("Connected! Running MINSKY deep scan across your account...");

        try {
          const syncRes = await syncGitHub(event.data.login, event.data.token);
          if (syncRes.success) {
            setSyncStatus("MINSKY scan completed! Advancing...");
          } else {
            setGithubError(syncRes.error || "Failed to scan GitHub repositories.");
          }
        } catch (err: any) {
          setGithubError(err?.message || "Sync failed.");
        } finally {
          setIsConnecting(false);
        }
      } else if (event.data?.type === "GITHUB_AUTH_ERROR") {
        window.removeEventListener("message", messageHandler);
        setGithubError(
          event.data.error === "incorrect_client_credentials"
            ? "GitHub configuration error: Invalid Client Secret. Please verify Signal settings."
            : event.data.error || "Authentication was cancelled."
        );
        setIsConnecting(false);
        setSyncStatus(null);
      }
    };

    window.addEventListener("message", messageHandler);
  };


  const handleDocumentUpload = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/dashboard");
    router.refresh();
  };


  return (
    <div className="shadow-input mx-auto w-full max-w-lg rounded-2xl bg-zinc-950/80 backdrop-blur-xl border border-zinc-800 p-6 md:p-8 dark:bg-black mt-8 animate-fade-in-up">
      <RealtimeScanModal
        isOpen={isScanModalOpen}
        onClose={() => {
          setIsScanModalOpen(false);
          setStep(3);
        }}
        githubUsername={authLogin}
        onComplete={() => {
          setTimeout(() => {
            setIsScanModalOpen(false);
            setStep(3);
          }, 800);
        }}
      />

      <div className="text-center mb-8">

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 mb-3">
          <span>Step {step} of 3</span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          {step === 1 && "Tell us about yourself"}
          {step === 2 && "Connect your GitHub"}
          {step === 3 && "Upload Documents"}
        </h2>
        <p className="text-zinc-400 mt-2 text-sm max-w-sm mx-auto">
          {step === 1 && "This helps us personalize your skill passport and roadmap."}
          {step === 2 && "Live GitProof analysis scans commits and verifies real coding skills."}
          {step === 3 && "Upload your certificates or resume to complete your passport."}
        </p>
      </div>

      <Form {...form}>
        <form className="my-6" onSubmit={(e) => e.preventDefault()}>
          {step === 1 && (
            <>
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <LabelInputContainer>
                      <FormLabel className="text-zinc-200">Full Name</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-900 border-zinc-800 text-white rounded-lg" placeholder="John Doe" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </LabelInputContainer>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="college_name"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <LabelInputContainer>
                      <FormLabel className="text-zinc-200">College / University</FormLabel>
                      <FormControl>
                        <Input className="bg-zinc-900 border-zinc-800 text-white rounded-lg" placeholder="IIT Delhi" type="text" {...field} />
                      </FormControl>
                      <FormMessage />
                    </LabelInputContainer>
                  </FormItem>
                )}
              />

              <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <LabelInputContainer>
                        <FormLabel className="text-zinc-200">Degree</FormLabel>
                        <FormControl>
                          <Input className="bg-zinc-900 border-zinc-800 text-white rounded-lg" placeholder="B.Tech CS" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </LabelInputContainer>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="graduation_year"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <LabelInputContainer>
                        <FormLabel className="text-zinc-200">Graduating Year</FormLabel>
                        <FormControl>
                          <Input className="bg-zinc-900 border-zinc-800 text-white rounded-lg" placeholder="2026" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </LabelInputContainer>
                    </FormItem>
                  )}
                />
              </div>

              <div className="mb-8 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <LabelInputContainer>
                        <FormLabel className="text-zinc-200">Gender</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full h-10 bg-zinc-900 border-zinc-800 text-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">Non-binary</SelectItem>
                            <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </LabelInputContainer>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="career_goal"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <LabelInputContainer>
                        <FormLabel className="text-zinc-200">Career Goal</FormLabel>
                        <FormControl>
                          <Input className="bg-zinc-900 border-zinc-800 text-white rounded-lg" placeholder="Frontend Engineer" type="text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </LabelInputContainer>
                    </FormItem>
                  )}
                />
              </div>

              <button
                className="group/btn relative flex justify-center items-center h-11 w-full rounded-xl bg-white hover:bg-zinc-200 font-semibold text-black transition-colors"
                type="button"
                onClick={handleNextStep}
              >
                Continue to GitHub →
              </button>
            </>
          )}          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-zinc-900/80 p-6 rounded-2xl border border-zinc-800 text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-800 border border-zinc-700 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="h-8 w-8 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Sync GitHub Account</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Authenticate to automatically import your repositories, commits, and verified skills.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleOAuthConnect}
                  disabled={isConnecting}
                  className="w-full h-12 gap-3 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl font-semibold transition-all shadow-lg text-sm disabled:opacity-80"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-zinc-950" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 fill-zinc-950" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      Connect with GitHub
                    </>
                  )}
                </Button>

                {syncStatus && (
                  <div className="flex items-center justify-center gap-2 p-3 text-xs text-zinc-300 bg-zinc-800/80 border border-zinc-700/50 rounded-xl animate-fade-in">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>{syncStatus}</span>
                  </div>
                )}

                {githubError && (
                  <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl animate-fade-in text-left">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{githubError}</span>
                  </div>
                )}
              </div>


              <div className="flex flex-col space-y-3 pt-2">
                <button
                  className="flex justify-center items-center h-10 w-full rounded-xl bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
                  type="button"
                  onClick={() => setStep(3)}
                >
                  Skip for now →
                </button>

                <button
                  className="flex justify-center items-center h-10 w-full rounded-xl bg-transparent text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
                  type="button"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {step === 3 && (

            <div className="space-y-6">
              <FileUpload onChange={(files) => console.log(files)} />

              <div className="flex flex-col space-y-3">
                <button
                  className="group/btn relative flex justify-center items-center h-11 w-full rounded-xl bg-white hover:bg-zinc-200 font-semibold text-black transition-colors"
                  type="button"
                  onClick={handleDocumentUpload}
                >
                  Finish Onboarding & Go to Dashboard →
                </button>

                <button
                  className="flex justify-center items-center h-10 w-full rounded-xl bg-transparent font-medium text-zinc-400 hover:text-white transition-colors"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
              </div>
            </div>
          )}
        </form>
      </Form>

    </div>
  );
}

const BottomGradient = () => {


  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

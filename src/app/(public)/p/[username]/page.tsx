import { createClient } from "@/lib/supabase/server";
import { PassportCard } from "@/components/passport/passport-card";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ username: string }>;
}

export default async function PublicPassportPage({ params }: PageProps) {
  const { username } = await params;
  const supabase = await createClient();

  // Find profile by username or ID
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .or(`username.eq.${username},id.eq.${username}`)
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch the latest public passport for this user
  const { data: passport } = await supabase
    .from("passports")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("is_public", true)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (!passport) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl border border-border/40 shadow-xl flex flex-col items-center max-w-sm text-center">
          <Shield className="h-12 w-12 text-muted-foreground mb-6" strokeWidth={1.5} />
          <h1 className="text-xl font-semibold text-foreground mb-2">Passport Private</h1>
          <p className="text-sm text-muted-foreground mb-8">This user&apos;s skill passport is currently private or does not exist.</p>
          <Link href="/" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            Build your own on Signal &rarr;
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        <div className="flex items-center justify-center mb-12">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background transition-transform group-hover:scale-105">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">Signal</span>
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
          <PassportCard data={passport.snapshot_data} />
        </div>
        
        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Powered by evidence-backed skill verification.</p>
          <Link href="/" className="text-primary hover:text-primary/80 transition-colors mt-2 inline-block font-medium">
            Build your own digital identity
          </Link>
        </div>
      </div>
    </div>
  );
}

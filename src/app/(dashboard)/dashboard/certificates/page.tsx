import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CertificateUploader } from "@/components/certificates/certificate-uploader";
import { FileBadge, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CertificatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch certificates
  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-6 sm:p-10 relative overflow-y-auto font-sans text-zinc-900 bg-white">
      <div className="w-full max-w-5xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 z-10 pb-6 border-b border-zinc-200/80">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold mb-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Credential Store
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 mb-1">
            My Certificates & Badges
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Upload and verify your accredited certificates to elevate your Skill Passport ranking.
          </p>
        </div>
        <CertificateUploader />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 z-10">
        {!certificates || certificates.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-zinc-300 rounded-2xl bg-zinc-50/60 p-8 text-center">
            <div className="w-14 h-14 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center mb-4 shadow-2xs">
              <FileBadge className="w-7 h-7 text-zinc-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mb-1">No certificates uploaded yet</h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-6">
              Connect your Credly badge or upload a certificate PDF/image to initiate instant cryptographic validation.
            </p>
            <CertificateUploader />
          </div>
        ) : (
          certificates.map((cert) => (
            <div
              key={cert.id}
              className="bg-[#fbfcfd] rounded-2xl border border-zinc-200/90 shadow-2xs p-5 hover:border-zinc-300 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-9 h-9 bg-zinc-900 text-white rounded-xl flex items-center justify-center shadow-2xs">
                    <FileBadge className="w-4 h-4" />
                  </div>
                  {cert.status === "verified" && (
                    <div className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] rounded-full font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </div>
                  )}
                  {cert.status === "pending" && (
                    <div className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] rounded-full font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Pending Scan
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-900 mb-0.5 truncate">{cert.title}</h3>
                <p className="text-xs text-zinc-500 mb-4 truncate">{cert.issuer || "Accredited Provider"}</p>
              </div>

              <a href={cert.file_url} target="_blank" rel="noreferrer" className="block w-full mt-2">
                <Button variant="outline" className="w-full bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200 text-xs h-8 shadow-2xs">
                  View Document
                </Button>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


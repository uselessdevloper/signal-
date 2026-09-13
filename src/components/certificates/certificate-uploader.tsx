"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadCertificateMetadata, verifyCredlyBadge, verifyOpenBadge } from "@/actions/certificates";
import { toast } from "sonner";
import { Loader2, UploadCloud, FileType2, Award, CheckCircle2, ShieldCheck, Link2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useRouter } from "next/navigation";

export function CertificateUploader({ children }: { children?: React.ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"file" | "credly">("credly");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [credlyUrl, setCredlyUrl] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 5 * 1024 * 1024) {
        toast.error("File size must be under 5MB");
        return;
      }
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleCredlyVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credlyUrl.trim()) return;

    try {
      setIsUploading(true);
      setErrorMessage(null);
      const res = await verifyCredlyBadge(credlyUrl.trim());
      if (res.success && res.badge) {
        toast.success(`Verified: ${res.badge.title} (${res.badge.issuer})`);
        setIsOpen(false);
        setCredlyUrl("");
        setErrorMessage(null);
        router.refresh();
      } else {
        const errText = res.error || "No certificate exists for this Credly badge ID or URL.";
        setErrorMessage(errText);
        toast.error(errText);
      }
    } catch (err: any) {
      const errText = err?.message || "No certificate exists or verification failed.";
      setErrorMessage(errText);
      toast.error(errText);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadMode === "credly") {
      return handleCredlyVerify(e);
    }

    if (!file || !title) return;

    try {
      setIsUploading(true);
      
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Please log in to upload certificates");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message || "Failed to upload file to storage.");
      }

      const { data: publicUrlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(fileName);

      const result = await uploadCertificateMetadata({
        title,
        issuer,
        fileUrl: publicUrlData.publicUrl,
        fileType: file.type,
        fileName
      });

      if (!result.success) {
        throw new Error(result.error || "No certificate exists or could be validated from this document. No certificate was added.");
      }

      toast.success("Certificate uploaded and verified successfully!");
      setIsOpen(false);
      setErrorMessage(null);
      
      setFile(null);
      setTitle("");
      setIssuer("");
    } catch (error: any) {
      const errText = error.message || "No certificate exists or could be validated from this document.";
      setErrorMessage(errText);
      toast.error(errText);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setErrorMessage(null);
      }}
    >
      <DialogTrigger render={
        children ? (
          children as React.ReactElement
        ) : (
          <button className={buttonVariants({ variant: "default", className: "gap-2" })}>
            <UploadCloud className="w-4 h-4" />
            Add Certificate
          </button>
        )
      } />
      <DialogContent className="dashboard-theme sm:max-w-[460px] bg-card border border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Add & Verify Certificate
          </DialogTitle>
          <DialogDescription className="text-zinc-500">
            Verify directly via Credly / Open Badges free API or upload a certificate document.
          </DialogDescription>
        </DialogHeader>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200/90 text-red-700 text-xs flex items-start gap-2.5 my-1 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-red-900 leading-snug">{errorMessage}</p>
              <p className="text-[11px] text-red-700/90">
                No mock certificate was added. Please verify your badge URL/file and ensure it is valid and public.
              </p>
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl mt-2">
          <button
            type="button"
            onClick={() => {
              setUploadMode("credly");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              uploadMode === "credly" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-blue-600" />
            Credly / Open Badge URL
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadMode("file");
              setErrorMessage(null);
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              uploadMode === "file" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>

        {uploadMode === "credly" ? (
          <form onSubmit={handleCredlyVerify} className="space-y-4 mt-3">
            <div className="space-y-2">
              <Label htmlFor="credlyUrl" className="text-zinc-900 font-semibold text-xs uppercase tracking-wider">
                Credly Badge URL or Badge ID *
              </Label>
              <Input
                id="credlyUrl"
                value={credlyUrl}
                onChange={(e) => setCredlyUrl(e.target.value)}
                placeholder="e.g. https://www.credly.com/badges/abc-123 or badge ID"
                required
                className="border-zinc-200 focus-visible:ring-zinc-900 font-mono text-xs"
              />
              <p className="text-[11px] text-zinc-500">
                Supports AWS, Google Cloud, Meta, IBM, Microsoft, CompTIA and all Open Badges standards.
              </p>
            </div>

            <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm gap-2" disabled={!credlyUrl.trim() || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying Cryptographic Badge...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Verify & Add to Passport
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-3">
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <div className="flex items-center gap-4">
                <Label 
                  htmlFor="file"
                  className="flex-1 cursor-pointer flex flex-col items-center justify-center p-5 border-2 border-dashed border-zinc-300 rounded-xl hover:border-zinc-500 hover:bg-zinc-50 transition-colors group"
                >
                  <FileType2 className="w-7 h-7 text-zinc-400 group-hover:text-zinc-600 mb-1.5 transition-colors" />
                  <span className="text-xs text-center font-bold text-zinc-900">
                    {file ? file.name : "Click to select a file"}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                    PDF, PNG, JPG (max. 5MB)
                  </span>
                </Label>
                <Input 
                  id="file" 
                  type="file" 
                  accept="application/pdf,image/png,image/jpeg" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-zinc-900 font-semibold text-xs uppercase tracking-wider">Certificate Name *</Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. AWS Solutions Architect"
                required
                className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="issuer" className="text-zinc-900 font-semibold text-xs uppercase tracking-wider">Issuing Organization</Label>
              <Input 
                id="issuer" 
                value={issuer} 
                onChange={(e) => setIssuer(e.target.value)} 
                placeholder="e.g. Amazon Web Services"
                className="border-zinc-200 focus-visible:ring-zinc-900 text-sm"
              />
            </div>

            <Button type="submit" className="w-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm" disabled={!file || !title || isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading & Scanning...
                </>
              ) : (
                "Upload and Save"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}


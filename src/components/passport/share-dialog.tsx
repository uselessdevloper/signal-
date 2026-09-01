"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Copy, Check, ExternalLink, Download, FileText, QrCode, Loader2 } from "lucide-react";
import { togglePassportVisibility } from "@/actions/passport";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface ShareDialogProps {
  isPublic: boolean;
  username: string;
}

export function ShareDialog({ isPublic: initialIsPublic, username }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // In production, use the actual domain. For dev, use origin.
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://signal.app';
  const shareUrl = `${baseUrl}/p/${username}`;

  const handleToggle = async (checked: boolean) => {
    try {
      setIsUpdating(true);
      await togglePassportVisibility(checked);
      setIsPublic(checked);
      toast.success(checked ? "Passport is now public" : "Passport is now private");
    } catch (error) {
      toast.error("Failed to update visibility");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = "signal-passport-qr.png";
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
      toast.success("QR Code downloaded!");
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const downloadPDF = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById("passport-card-capture");
      if (!element) throw new Error("Card element not found");
      
      // Temporarily set a background color if the element relies on dark mode page background
      const originalBg = element.style.backgroundColor;
      element.style.backgroundColor = "hsl(var(--background))";
      
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        backgroundColor: null
      });
      
      element.style.backgroundColor = originalBg;
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Add a slight margin
      const margin = 10;
      pdf.addImage(imgData, "PNG", margin, margin, pdfWidth - (margin*2), pdfHeight - (margin*2));
      pdf.save(`signal-skill-passport-${username}.pdf`);
      
      toast.success("PDF downloaded successfully!");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={
        <button className={buttonVariants({ variant: "default", className: "gap-2 bg-foreground text-background hover:bg-foreground/90" })}>
          <Share2 className="w-4 h-4" />
          Share & Export
        </button>
      } />
      <DialogContent className="dashboard-theme sm:max-w-md bg-card border border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-zinc-900">Share Your Skill Passport</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Make your passport public to share it, or download it as a PDF.
          </DialogDescription>
        </DialogHeader>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <Button 
            variant="outline" 
            className="h-16 flex flex-col gap-1 items-center justify-center bg-card border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
            onClick={downloadPDF}
            disabled={isDownloading}
          >
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-900" /> : <FileText className="w-5 h-5 text-zinc-900" />}
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900 mt-1">Download PDF</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 flex flex-col gap-1 items-center justify-center bg-card border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
            onClick={downloadQR}
            disabled={!isPublic}
          >
            <QrCode className="w-5 h-5 text-zinc-900" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900 mt-1">Download QR</span>
          </Button>
        </div>

        <div className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg bg-zinc-50 mt-2">
          <div className="space-y-0.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Public Access</Label>
            <p className="text-xs text-zinc-500">
              Anyone with the link can view your passport.
            </p>
          </div>
          <Switch
            checked={isPublic}
            onCheckedChange={handleToggle}
            disabled={isUpdating}
          />
        </div>

        {isPublic && (
          <div className="space-y-6 mt-2 animate-fade-in-up">
            <div className="flex justify-center p-4 bg-white rounded-xl mx-auto w-fit">
              <QRCodeSVG 
                id="qr-code-svg"
                value={shareUrl} 
                size={160}
                level="H"
                includeMargin={true}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Public Link</Label>
              <div className="flex items-center gap-2">
                <Input 
                  readOnly 
                  value={shareUrl} 
                  className="bg-white text-zinc-900 border-zinc-200 focus-visible:ring-zinc-900"
                />
                <Button size="icon" variant="outline" onClick={copyToClipboard} className="shrink-0 border-zinc-200 hover:bg-zinc-100 text-zinc-900">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="outline" onClick={() => window.open(shareUrl, '_blank')} className="shrink-0 border-zinc-200 hover:bg-zinc-100 text-zinc-900">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

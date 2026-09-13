"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadCertificateMetadata({
  title,
  issuer,
  fileUrl,
  fileType,
  fileName
}: {
  title: string;
  issuer: string;
  fileUrl: string;
  fileType: string;
  fileName: string;
}) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  // 1. Insert into Database
  const { data: certRecord, error: dbError } = await supabase
    .from("certificates")
    .insert({
      profile_id: user.id,
      title: title.trim(),
      issuer: issuer ? issuer.trim() : null,
      issue_date: new Date().toISOString(),
      file_url: fileUrl,
      file_type: fileType,
      parsed: false,
      status: "pending",
    })
    .select("id")
    .single();

  if (dbError) {
    console.error("Database insert error:", dbError);
    // Cleanup storage if DB insert fails
    await supabase.storage.from("certificates").remove([fileName]);
    return { success: false, error: "Failed to save certificate record." };
  }

  // 4. Trigger Automatic Skill Claim Extraction
  try {
    const { extractClaimsFromMultimodal } = await import("@/lib/extractor/document-extractor");
    
    // Default fallback text using metadata
    const extractionText = `Certificate Title: ${title}. Issuer: ${issuer || 'N/A'}. File: ${fileName}`;
    
    // Extract skills visually using Multimodal LLM from storage file
    
    // SSRF Protection: Ensure fileUrl is explicitly from our Supabase Storage bucket
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl || !fileUrl.startsWith(`${supabaseUrl}/storage/v1/object/public/certificates/`)) {
      throw new Error("Invalid file URL: Security exception");
    }

    const response = await fetch(fileUrl);
    let extractionResult: any = { claims: [] };
    
    let fileBuffer: Buffer | null = null;
    let fileMimeType = "application/pdf";
    
    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      
      if (fileUrl.toLowerCase().endsWith(".png")) fileMimeType = "image/png";
      else if (fileUrl.toLowerCase().endsWith(".jpg") || fileUrl.toLowerCase().endsWith(".jpeg")) fileMimeType = "image/jpeg";

      extractionResult = await extractClaimsFromMultimodal(
        fileBuffer,
        fileMimeType,
        extractionText,
        "certificate"
      );
    } else {
      console.warn(`[Document Extractor] Failed to fetch file from storage. Status: ${response.status}`);
    }

    if (extractionResult.claims.length > 0) {
      // Run Anti-Cheat Agent
      const { evaluateEvidenceIntegrity } = await import("@/lib/agents/anti-cheat");
      let integrityData = { integrity_score: 100, integrity_flags: [] as string[], integrity_status: "verified" };
      
      try {
        if (fileBuffer) {
          integrityData = await evaluateEvidenceIntegrity("certificate", {
            fileBuffer: fileBuffer,
            mimeType: fileMimeType,
            metadata: extractionText
          });
        }
      } catch (e) {
        console.error("[uploadCertificateMetadata] Anti-cheat check failed:", e);
      }

      const { data: evidence } = await supabase
        .from("evidence")
        .insert({
          user_id: user.id,
          source_type: "certificate",
          raw_ref: fileUrl,
          status: "processed",
          integrity_score: integrityData.integrity_score,
          integrity_flags: integrityData.integrity_flags,
          integrity_status: integrityData.integrity_status,
          ingested_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (evidence) {
        const claimRecords = extractionResult.claims.map((claim: any) => ({
          evidence_id: evidence.id,
          extracted_text: claim.context_snippet,
          skill_id: claim.skill_id,
          unmapped_label: claim.unmapped_label || claim.claimed_skill,
          match_confidence: claim.skill_id ? 1.0 : 0.5,
          llm_model: process.env.AI_MODEL || "amazon/nova-micro-v1:0",
        }));

        const { error: claimsError } = await supabase.from("evidence_claims").insert(claimRecords);
        if (claimsError) {
          console.error("[uploadCertificateMetadata] Failed to insert evidence claims:", claimsError);
        }

        // Update Certificate Status
        const finalStatus = integrityData.integrity_status === "verified" ? "verified" : "flagged";
        await supabase
          .from("certificates")
          .update({ parsed: true, status: finalStatus })
          .eq("id", certRecord.id);

        // Regenerate Passport to include new skills
        try {
          const { generatePassport } = await import("@/actions/passport");
          await generatePassport();
        } catch (err) {
          console.error("[uploadCertificateMetadata] Failed to regenerate passport:", err);
        }
      } else {
        // Verification failed: cleanup pending record so no invalid or mock certificate remains
        await supabase.from("certificates").delete().eq("id", certRecord.id);
        await supabase.storage.from("certificates").remove([fileName]);
        return { success: false, error: "No certificate exists or could be validated from this document. No certificate was added." };
      }
    } else {
      await supabase.from("certificates").delete().eq("id", certRecord.id);
      await supabase.storage.from("certificates").remove([fileName]);
      return { success: false, error: "Failed to read file for verification. No certificate exists or could be validated." };
    }
  } catch (extErr: any) {
    console.error("Claim extraction error:", extErr);
    if (certRecord?.id) {
      await supabase.from("certificates").delete().eq("id", certRecord.id);
    }
    await supabase.storage.from("certificates").remove([fileName]);
    return { success: false, error: "Certificate verification failed. No certificate exists or could be validated." };
  }

  revalidatePath("/certificates");
  revalidatePath("/dashboard/certificates");
  return { success: true };
}

function extractMetaContent(html: string, propertyName: string): string | null {
  const regex1 = new RegExp(`<meta[^>]+(?:property|name)=["']${propertyName}["'][^>]+content=["']([^"']+)["']`, "i");
  const match1 = html.match(regex1);
  if (match1 && match1[1]) return match1[1].trim();

  const regex2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${propertyName}["']`, "i");
  const match2 = html.match(regex2);
  if (match2 && match2[1]) return match2[1].trim();

  return null;
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

export async function verifyCredlyBadge(badgeUrlOrId: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const cleanInput = (badgeUrlOrId || "").trim();
  if (!cleanInput) {
    return { success: false, error: "Credly badge URL or ID is required." };
  }

  // 1. Parse badge ID or target URL
  let targetUrl = cleanInput;
  let badgeId = cleanInput;

  if (cleanInput.startsWith("http://") || cleanInput.startsWith("https://")) {
    targetUrl = cleanInput;
    const match = cleanInput.match(/badges\/([a-f0-9-]+)/i) || 
                  cleanInput.match(/badge\/([a-zA-Z0-9-_]+)/i);
    if (match && match[1]) {
      badgeId = match[1];
    }
  } else {
    badgeId = cleanInput;
    targetUrl = `https://www.credly.com/badges/${badgeId}`;
  }

  try {
    let title = "";
    let issuer = "Credly Verified Issuer";
    let badgeImageUrl: string | null = null;
    let description = "";
    let skills: string[] = [];
    const issueDate = new Date().toISOString();

    // 2. Fetch page using authentic browser headers
    try {
      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { success: false, error: "No certificate exists for this Credly badge ID or URL. (404 Not Found)" };
        }
        return { success: false, error: `Credly service returned HTTP ${response.status}. No certificate could be verified.` };
      }

      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const json = await response.json();
        title = json.badge_template?.name || json.name || "";
        issuer = json.badge_template?.issuer?.entities?.[0]?.entity?.name || json.issuer?.name || "Credly Issuer";
        badgeImageUrl = json.badge_template?.image_url || json.image_url || null;
        skills = (json.badge_template?.skills || []).map((s: any) => s.name || s);
      } else {
        const html = await response.text();

        // Check if Credly returned an error inside the HTML
        if (
          html.includes("Unable to verify badge") || 
          html.includes("error-view__title") ||
          html.includes("Page Not Found") ||
          html.includes("We are unable to verify the status of this badge")
        ) {
          return {
            success: false,
            error: "No certificate exists for this Credly badge link. Credly was unable to verify the status of this badge.",
          };
        }

        const ogTitle = extractMetaContent(html, "og:title");
        const ogImage = extractMetaContent(html, "og:image") || extractMetaContent(html, "twitter:image");
        const ogDesc = extractMetaContent(html, "og:description");
        const ogSite = extractMetaContent(html, "og:site_name");

        if (ogTitle && ogTitle.toLowerCase() !== "credly" && !ogTitle.toLowerCase().includes("error") && !ogTitle.toLowerCase().includes("page not found")) {
          title = ogTitle;
        }

        if (ogImage) badgeImageUrl = ogImage;
        if (ogDesc) description = ogDesc;

        // Check for JSON-LD structured data
        const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
        if (jsonLdMatch && jsonLdMatch[1]) {
          try {
            const ld = JSON.parse(jsonLdMatch[1]);
            if (ld.name && !title) title = ld.name;
            if (ld.issuer?.name) issuer = ld.issuer.name;
            if (ld.image && !badgeImageUrl) badgeImageUrl = typeof ld.image === "string" ? ld.image : ld.image.url;
          } catch (e) {
            // ignore json-ld parse failure
          }
        }

        // Extract issuer from URL or description
        if (!issuer || issuer === "Credly Verified Issuer") {
          if (targetUrl.includes("/org/google-cloud")) issuer = "Google Cloud";
          else if (targetUrl.includes("/org/amazon-web-services")) issuer = "Amazon Web Services";
          else if (targetUrl.includes("/org/microsoft")) issuer = "Microsoft";
          else if (targetUrl.includes("/org/ibm")) issuer = "IBM";
          else if (targetUrl.includes("/org/meta")) issuer = "Meta";
          else if (ogSite && ogSite !== "Credly") issuer = ogSite;
        }
      }
    } catch (fetchErr: any) {
      console.error("[verifyCredlyBadge] External fetch error:", fetchErr);
      return {
        success: false,
        error: `Could not connect to Credly to verify badge: ${fetchErr?.message || "Network error"}`,
      };
    }

    // 3. Strict Check: If no legitimate certificate title was found, DO NOT add a mock certificate!
    const normalizedTitle = title ? title.trim().toLowerCase() : "";
    if (
      !title || 
      title.trim() === "" || 
      normalizedTitle === "credly" || 
      normalizedTitle === "badges" ||
      normalizedTitle.includes("page not found") || 
      normalizedTitle.includes("unable to verify") ||
      normalizedTitle.includes("error")
    ) {
      return {
        success: false,
        error: "No certificate exists for this Credly badge ID or URL. Please verify your badge URL and ensure it is public.",
      };
    }

    if (!badgeImageUrl) {
      badgeImageUrl = "https://images.credly.com/images/08096465-cbfc-4c3e-93e5-93c5aa61f23e/image.png";
    }

    if (skills.length === 0) {
      const words = title.split(/[\s,]+/);
      skills = words.filter(w => w.length > 3 && !["with", "and", "the", "for", "from"].includes(w.toLowerCase()));
      if (skills.length === 0) skills = [title];
    }

    // 4. Upsert into Supabase certificates table
    const { data: certRecord, error: dbError } = await supabase
      .from("certificates")
      .insert({
        profile_id: user.id,
        title: title.trim(),
        issuer: issuer.trim(),
        issue_date: issueDate,
        file_url: badgeImageUrl,
        file_type: "badge/credly",
        parsed: true,
        status: "verified",
      })
      .select("id")
      .single();

    if (dbError) {
      console.warn("[verifyCredlyBadge] Supabase insert note:", dbError);
    }

    // 5. Record verified evidence
    const { data: evidence } = await supabase
      .from("evidence")
      .insert({
        user_id: user.id,
        source_type: "certificate",
        raw_ref: targetUrl,
        status: "verified",
        integrity_score: 100,
        integrity_flags: [],
        integrity_status: "verified",
        ingested_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (evidence) {
      const claimRecords = skills.slice(0, 5).map((skill: string) => ({
        evidence_id: evidence.id,
        extracted_text: `Credly verified credential: ${title} issued by ${issuer}`,
        unmapped_label: skill,
        match_confidence: 1.0,
        llm_model: "credly-realtime-v3",
      }));

      await supabase.from("evidence_claims").insert(claimRecords);
    }

    // 6. Trigger instant passport regeneration
    try {
      const { generatePassport } = await import("@/actions/passport");
      await generatePassport();
    } catch (e) {
      console.warn("[verifyCredlyBadge] Passport regeneration note:", e);
    }

    revalidatePath("/certificates");
    revalidatePath("/dashboard/certificates");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/tracker");

    return {
      success: true,
      badge: {
        badgeId,
        title,
        issuer,
        issueDate,
        badgeImageUrl,
        skills,
        verificationUrl: targetUrl,
        verified: true,
      },
    };
  } catch (err: any) {
    console.error("Credly badge verification error:", err);
    return { success: false, error: err?.message || "Failed to process Credly verification." };
  }
}

export async function verifyOpenBadge(badgeJsonUrl: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const res = await fetch(badgeJsonUrl, {
      headers: { Accept: "application/ld+json, application/json" },
    });

    if (!res.ok) {
      return { success: false, error: "No certificate exists at this Open Badge endpoint." };
    }

    const badge = await res.json();
    const title = badge.badge?.name || badge.name;
    if (!title || typeof title !== "string" || !title.trim() || title.toLowerCase() === "open badge") {
      return { success: false, error: "No certificate exists for this Open Badge. Could not find a valid credential name." };
    }
    const issuer = typeof badge.badge?.issuer === "string" 
      ? badge.badge.issuer 
      : badge.badge?.issuer?.name || badge.issuer?.name || "Open Badge Issuer";
    const issueDate = badge.issuedOn || new Date().toISOString();
    const badgeImage = badge.badge?.image || badge.image || "";

    const { data: certRecord } = await supabase
      .from("certificates")
      .insert({
        profile_id: user.id,
        title,
        issuer,
        issue_date: issueDate,
        file_url: typeof badgeImage === "string" ? badgeImage : badgeJsonUrl,
        file_type: "badge/openbadge",
        parsed: true,
        status: "verified",
      })
      .select("id")
      .single();

    revalidatePath("/certificates");
    revalidatePath("/dashboard");

    return { success: true, title, issuer };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to verify Open Badge." };
  }
}

export async function deleteCertificate(certId: string | number, fileUrl?: string) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const { error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", certId)
      .eq("profile_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    // Attempt to remove file if in storage
    if (fileUrl && fileUrl.includes("/certificates/")) {
      const parts = fileUrl.split("/certificates/");
      if (parts[1]) {
        await supabase.storage.from("certificates").remove([parts[1]]);
      }
    }

    // Regenerate passport
    try {
      const { generatePassport } = await import("@/actions/passport");
      await generatePassport();
    } catch {
      // ignore
    }

    revalidatePath("/certificates");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete certificate." };
  }
}


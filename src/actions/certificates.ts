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
        return { success: false, error: "No skills could be extracted from this document." };
      }
    } else {
      return { success: false, error: "Failed to read file for extraction." };
    }
  } catch (extErr: any) {
    console.error("Claim extraction error:", extErr);
    return { success: false, error: extErr.message || "Failed to process certificate with AI." };
  }

  revalidatePath("/certificates");
  return { success: true };
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

  // Extract badge ID from various Credly URL formats
  let badgeId = cleanInput;
  const match = cleanInput.match(/badges\/([a-f0-9-]+)/i) || cleanInput.match(/badge\/([a-f0-9-]+)/i);
  if (match && match[1]) {
    badgeId = match[1];
  }

  try {
    // 1. Fetch public Credly badge JSON
    const credlyRes = await fetch(`https://www.credly.com/badges/${badgeId}.json`, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Signal-CredentialVerifier/2.0",
      },
    });

    if (!credlyRes.ok) {
      if (credlyRes.status === 404) {
        return { success: false, error: "Credly badge not found. Please verify the badge URL." };
      }
      return { success: false, error: `Credly verification service returned HTTP ${credlyRes.status}` };
    }

    const badgeData = await credlyRes.json();

    const title = badgeData.badge_template?.name || badgeData.name || "Verified Credly Certification";
    const issuer = badgeData.badge_template?.issuer?.entities?.[0]?.entity?.name || 
                   badgeData.badge_template?.issuer?.name || 
                   badgeData.issuer?.name || 
                   "Credly Issuer";
    const issueDate = badgeData.issued_at_date || badgeData.issued_at || new Date().toISOString();
    const expiresAt = badgeData.expires_at_date || badgeData.expires_at || null;
    const badgeImageUrl = badgeData.badge_template?.image_url || badgeData.image_url || badgeData.image?.id || null;
    const earnerName = badgeData.recipient_email || badgeData.issued_to || "Recipient";
    const skills = (badgeData.badge_template?.skills || []).map((s: any) => s.name || s);

    // 2. Insert verified certificate into database
    const { data: certRecord, error: dbError } = await supabase
      .from("certificates")
      .insert({
        profile_id: user.id,
        title: title.trim(),
        issuer: issuer.trim(),
        issue_date: issueDate,
        file_url: badgeImageUrl || `https://www.credly.com/badges/${badgeId}`,
        file_type: "badge/credly",
        parsed: true,
        status: "verified",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("Credly DB save error:", dbError);
      return { success: false, error: "Failed to save verified Credly credential." };
    }

    // 3. Record verified evidence
    const { data: evidence } = await supabase
      .from("evidence")
      .insert({
        user_id: user.id,
        source_type: "certificate",
        raw_ref: `https://www.credly.com/badges/${badgeId}`,
        status: "verified",
        integrity_score: 100,
        integrity_flags: [],
        integrity_status: "verified",
        ingested_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (evidence) {
      const extractedSkills = skills.length > 0 ? skills : [title];
      const claimRecords = extractedSkills.map((skill: string) => ({
        evidence_id: evidence.id,
        extracted_text: `Credly verified certification: ${title} issued by ${issuer}`,
        unmapped_label: skill,
        match_confidence: 1.0,
        llm_model: "credly-direct-v2",
      }));

      await supabase.from("evidence_claims").insert(claimRecords);
    }

    // 4. Trigger instant passport regeneration
    try {
      const { generatePassport } = await import("@/actions/passport");
      await generatePassport();
    } catch (e) {
      console.error("Passport regeneration trigger failed:", e);
    }

    revalidatePath("/certificates");
    revalidatePath("/dashboard");

    return {
      success: true,
      badge: {
        badgeId,
        title,
        issuer,
        issueDate,
        expiresAt,
        badgeImageUrl,
        earnerName,
        skills,
        verificationUrl: `https://www.credly.com/badges/${badgeId}`,
      },
    };
  } catch (err: any) {
    console.error("Credly badge verification error:", err);
    return { success: false, error: err?.message || "Failed to verify Credly badge." };
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
      return { success: false, error: "Failed to resolve Open Badge JSON-LD endpoint." };
    }

    const badge = await res.json();
    const title = badge.badge?.name || badge.name || "Open Badge Credential";
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


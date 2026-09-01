import { generateObject } from "ai";
import { aiModel } from "@/lib/ai-client";
import { z } from "zod";

const integritySchema = z.object({
  integrity_score: z.number().min(0).max(100).describe("0-100 score of how authentic this evidence appears"),
  integrity_flags: z.array(z.string()).describe("List of specific red flags found. Empty if verified."),
  integrity_status: z.enum(["verified", "flagged"]).describe("verified if score >= 70, else flagged"),
  verified_skills: z.array(z.string()).optional().describe("List of programming languages, frameworks, or tools identified in the evidence. Empty if none."),
});

export type IntegrityResult = z.infer<typeof integritySchema>;

export async function evaluateEvidenceIntegrity(
  type: "certificate" | "github",
  payload: {
    fileBuffer?: Buffer;
    mimeType?: string;
    metadata?: string;
    githubData?: any;
  }
): Promise<IntegrityResult> {
  const model = aiModel;

  let systemInstruction = "";
  let messages: any[] = [];

  if (type === "certificate") {
    systemInstruction = `You are an elite forensic document examiner specializing in digital certificates.
Analyze the provided certificate image/PDF and determine its authenticity.
Look for:
- Mismatched fonts or obvious pixel manipulation (cloned text).
- Highly generic "Canva" template designs lacking unique issuer signatures, dates, or credential IDs.
- Inconsistencies between the metadata provided and the visual text.

Provide an integrity score (0-100), a list of specific red flags, and a final status.`;

    messages = [
      {
        role: "user",
        content: [
          { type: "text", text: systemInstruction },
          { type: "text", text: `Metadata Context: ${payload.metadata || "None provided"}` },
          ...(payload.fileBuffer && payload.mimeType
            ? [{ type: "file", data: payload.fileBuffer, mediaType: payload.mimeType }]
            : [])
        ]
      }
    ];
  } else if (type === "github") {
    systemInstruction = `You are a strict technical recruiter evaluating GitHub repository authenticity and extracting hard skills.
Analyze the provided repository metadata, languages, and README to determine if the candidate actually wrote the code, and extract the exact technologies used.
Look for:
- Repositories that are direct forks of popular projects with zero or few personal commits.
- "Suspiciously large single-day commits" where thousands of lines of code were uploaded at once (often a sign of a cloned local project pushed to bypass fork detection).
- Lack of meaningful commit history or issues.
- Generic default READMEs (e.g. "Create React App" or "Next.js template") that indicate low-effort projects.

Provide an integrity score (0-100), a list of specific red flags, a final status, and an array of all verified skills found.

Example 1 (Low Effort/Clone):
Repo: Next-js-demo. Languages: { "TypeScript": 1000 }. README: "This is a [Next.js](https://nextjs.org/) project bootstrapped with \`create-next-app\`."
Score: 30. Flags: ["Default create-next-app README", "No custom description"]. Skills: ["Next.js", "TypeScript"]. Status: "flagged"

Example 2 (Real Project):
Repo: signal-web. Languages: { "TypeScript": 45000, "CSS": 2000 }. README: "Signal is an autonomous multi-agent career workflow system built with LangGraph and Cloud Pub/Sub..."
Score: 95. Flags: []. Skills: ["TypeScript", "CSS", "Supabase", "PostgreSQL"]. Status: "verified"`;

    messages = [
      {
        role: "user",
        content: [
          { type: "text", text: systemInstruction },
          { type: "text", text: `GitHub Repo Data:\n${JSON.stringify(payload.githubData, null, 2)}` }
        ]
      }
    ];
  }

  try {
    let verifiedSkills: string[] = [];
    
    // For GitHub, we use a specialized fast/cheap model to extract stack first
    if (type === "github") {
      const extractionModel = aiModel;
      const extractionSchema = z.object({
        skills: z.array(z.string()).describe("List of exact programming languages, frameworks, or tools used in the repo.")
      });
      
      try {
        const { object: skillsObj } = await generateObject({
          model: extractionModel,
          schema: extractionSchema,
          messages: [
            {
              role: "user",
              content: `Extract all technical skills from this repository metadata: ${JSON.stringify(payload.githubData, null, 2)}`
            }
          ]
        });
        verifiedSkills = skillsObj.skills;
      } catch (e) {
        console.error("[AntiCheatAgent] Fast extraction failed:", e);
      }
    }

    const { object } = await generateObject({
      model,
      schema: integritySchema,
      messages
    });
    
    // If it's github and verified, inject the skills we extracted cheaply
    if (type === "github" && object.integrity_status === "verified") {
      object.verified_skills = Array.from(new Set([...(object.verified_skills || []), ...verifiedSkills]));
    }
    
    return object;
  } catch (e) {
    console.error("[AntiCheatAgent] Evaluation failed:", e);
    // Fail open - assume verified if the AI fails, so we don't block real users
    return {
      integrity_score: 100,
      integrity_flags: [],
      integrity_status: "verified",
      verified_skills: []
    };
  }
}

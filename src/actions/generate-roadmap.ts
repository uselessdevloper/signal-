"use server";

import { createClient } from "@/lib/supabase/server";
import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { revalidatePath } from "next/cache";

export async function generateAiRoadmap(goalTitle: string, missingSkills: string[]) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Unauthorized");
  }

  // Fetch current passport to update
  const { data: passport } = await supabase
    .from("passports")
    .select("*")
    .eq("profile_id", user.id)
    .order("version", { ascending: false })
    .limit(1)
    .single();

  if (!passport) {
    throw new Error("No passport found. Generate one first.");
  }

  const apiKey = process.env.AICREDIT_API_KEY || "";
  let parsedRoadmap;

  if (!apiKey || apiKey === "your-ai-api-key") {
    // Fallback Mock for testing if no API key is provided
    console.warn("No valid API_KEY provided. Using mocked roadmap.");
    parsedRoadmap = {
      learningOrder: missingSkills.map((skill, index) => ({
        step: index + 1,
        skill: skill,
        description: `Learn the fundamentals of ${skill} and build small functional components.`
      })),
      suggestedProject: {
        title: `${goalTitle} Capstone Project`,
        description: `A comprehensive project utilizing ${missingSkills.join(", ")}.`,
        features: ["Authentication", "Database Integration", "Responsive UI"]
      }
    };
  } else {
    try {
      const aicredit = createOpenAI({
        baseURL: "https://aicredits.in/api/v1",
        apiKey: apiKey,
      });
      
      const prompt = `
You are an expert technical career coach. The user wants to become a ${goalTitle}.
They already have some skills, but they are missing the following critical skills: ${missingSkills.join(", ")}.

Generate a learning roadmap matching the JSON schema.
For 'learningOrder', provide chronologically ordered steps to learn each skill with a 1-sentence description.
For 'suggestedProject', design a capstone project utilizing the missing skills.`;

      const { object } = await generateObject({
        model: aicredit('allenai/olmo-3-32b-think'),
        schema: z.object({
          learningOrder: z.array(z.object({
            step: z.number(),
            skill: z.string(),
            description: z.string()
          })),
          suggestedProject: z.object({
            title: z.string(),
            description: z.string(),
            features: z.array(z.string())
          })
        }),
        prompt,
      });

      parsedRoadmap = object;
    } catch (error) {
      const e = error as Error;
      console.error("AI Generation Error:", e);
      throw new Error("Failed to generate AI roadmap. " + e.message);
    }
  }

  // Append to passport snapshot_data
  const updatedSnapshot = {
    ...passport.snapshot_data,
    roadmap: parsedRoadmap
  };

  const { error: updateError } = await supabase
    .from("passports")
    .update({ snapshot_data: updatedSnapshot })
    .eq("id", passport.id);

  if (updateError) {
    throw new Error("Failed to save roadmap to passport.");
  }

  revalidatePath("/roadmap");
  return { success: true, roadmap: parsedRoadmap };
}

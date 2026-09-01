"use server";

import { createClient } from "@/lib/supabase/server";
import { Octokit } from "octokit";
import { revalidatePath } from "next/cache";

export async function syncGitHub(username: string, token: string) {
  const supabase = await createClient();
  const octokit = new Octokit({
    auth: token,
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const { data: ghUser } = await octokit.rest.users.getByUsername({ username });

    const { data: connection, error: connectionError } = await supabase
      .from("github_connections")
      .upsert(
        {
          profile_id: user.id,
          github_username: ghUser.login,
          access_token: token,
          avatar_url: ghUser.avatar_url,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" }
      )
      .select("id")
      .single();

    if (connectionError || !connection) {
      console.error("Connection Error:", connectionError);
      return { success: false, error: "Failed to save GitHub connection." };
    }

    // Fetch full repository catalog (up to 100 repositories)
    const { data: repos } = await octokit.rest.repos.listForUser({
      username,
      type: "all",
      sort: "updated",
      per_page: 100,
    });

    const relevantRepos = repos.filter((r) => !r.fork && (r.size || 0) > 0).slice(0, 30);
    const { evaluateEvidenceIntegrity } = await import("@/lib/agents/anti-cheat");

    // Clear old repos for this connection to avoid duplicates
    await supabase.from("github_repos").delete().eq("connection_id", connection.id);

    const extractedAccountSkills = new Set<string>();

    await Promise.all(relevantRepos.map(async (repo) => {
      let languages: Record<string, number> = {};
      try {
        const { data: langData } = await octokit.rest.repos.listLanguages({
          owner: repo.owner.login || username,
          repo: repo.name,
        });
        languages = langData as Record<string, number>;
        Object.keys(languages).forEach(l => extractedAccountSkills.add(l));
      } catch (langError) {
        if (repo.language) {
          languages[repo.language] = 1000;
          extractedAccountSkills.add(repo.language);
        }
      }

      let readmeSnippet = "None";
      try {
        const { data: readmeData } = await octokit.rest.repos.getReadme({
          owner: repo.owner.login || username,
          repo: repo.name,
        });
        if (readmeData && !Array.isArray(readmeData) && readmeData.content) {
          const decoded = Buffer.from(readmeData.content, 'base64').toString('utf-8');
          readmeSnippet = decoded.substring(0, 1500);
        }
      } catch (readmeError) {
        // Ignore 404s
      }

      let integrityData = {
        integrity_score: 95,
        integrity_flags: [] as string[],
        integrity_status: "verified",
        verified_skills: Object.keys(languages)
      };

      try {
        const aiResult = await evaluateEvidenceIntegrity("github", {
          githubData: {
            name: repo.name,
            description: repo.description,
            size: repo.size,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            open_issues_count: repo.open_issues_count,
            pushed_at: repo.pushed_at,
            created_at: repo.created_at,
            updated_at: repo.updated_at,
            languages: languages,
            readme_snippet: readmeSnippet
          }
        });
        integrityData = { ...integrityData, ...aiResult } as any;
        if (integrityData.verified_skills) {
          integrityData.verified_skills.forEach(s => extractedAccountSkills.add(s));
        }
      } catch (e) {
        console.error(`[AntiCheat] Failed to verify GitHub repo ${repo.name}`, e);
      }

      const { data: savedRepo, error: repoError } = await supabase
        .from("github_repos")
        .insert({
          connection_id: connection.id,
          name: repo.name,
          description: repo.description,
          is_fork: repo.fork,
          primary_language: repo.language || Object.keys(languages)[0] || "Code",
          stars_count: repo.stargazers_count || 0,
          forks_count: repo.forks_count || 0,
          html_url: repo.html_url,
          integrity_score: integrityData.integrity_score,
          integrity_flags: integrityData.integrity_flags,
          integrity_status: integrityData.integrity_status,
          synced_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (repoError || !savedRepo) {
        console.error("Repo save error:", repoError);
        return;
      }

      const langInserts = Object.entries(languages).map(([lang, bytes]) => ({
        repo_id: savedRepo.id,
        language: lang,
        bytes: bytes as number,
      }));

      if (langInserts.length > 0) {
        await supabase.from("repo_languages").insert(langInserts);
      }

      // Save extracted skills to evidence table if verified
      if (integrityData.integrity_status === "verified" && integrityData.verified_skills && integrityData.verified_skills.length > 0) {
        const { data: evidenceRecord, error: evError } = await supabase.from("evidence").insert({
          user_id: user.id,
          source_type: "github",
          raw_ref: repo.html_url,
          status: "verified",
          integrity_score: integrityData.integrity_score,
          integrity_status: integrityData.integrity_status,
          integrity_flags: integrityData.integrity_flags
        }).select("id").single();

        if (evidenceRecord && !evError) {
          const claims = integrityData.verified_skills.map((skill: string) => ({
            evidence_id: evidenceRecord.id,
            extracted_text: `Used ${skill} in repository ${repo.name}`,
            unmapped_label: skill,
            match_confidence: 1.0,
            llm_model: "amazon/nova-micro-v1:0"
          }));
          if (claims.length > 0) {
            await supabase.from("evidence_claims").insert(claims);
          }
        }
      }
    }));

    revalidatePath("/github");
    revalidatePath("/dashboard");
    return { success: true, verifiedSkills: Array.from(extractedAccountSkills) };
  } catch (error) {
    const err = error as Error;
    console.error("GitHub Sync Error:", err);
    return { success: false, error: err.message || "Failed to sync GitHub data." };
  }
}


export async function disconnectGitHub() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("github_connections")
    .delete()
    .eq("profile_id", user.id);

  if (error) {
    return { success: false, error: "Failed to disconnect GitHub" };
  }

  revalidatePath("/github");
  return { success: true };
}

export async function analyzeGitHubRealtime(username: string, token?: string) {
  const cleanUsername = (username || "").trim().replace(/^@/, "");
  if (!cleanUsername) {
    return { success: false, error: "GitHub username is required." };
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Signal-GitProof/2.0",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    // 1. Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${cleanUsername}`, { headers });
    if (userRes.status === 404) {
      return { success: false, error: `GitHub user "${cleanUsername}" was not found.` };
    }
    if (!userRes.ok) {
      return { success: false, error: `GitHub API error: ${userRes.statusText}` };
    }

    const ghUser = await userRes.json();

    // 2. Fetch repos
    const reposRes = await fetch(
      `https://api.github.com/users/${cleanUsername}/repos?sort=pushed&per_page=15`,
      { headers }
    );
    if (!reposRes.ok) {
      return { success: false, error: "Failed to retrieve user repositories." };
    }

    const reposData: any[] = await reposRes.json();
    const activeRepos = reposData.filter((r) => !r.fork && (r.size || 0) > 0).slice(0, 6);

    const { evaluateEvidenceIntegrity } = await import("@/lib/agents/anti-cheat");
    const allSkills = new Set<string>();
    const langTotals: Record<string, number> = {};
    let totalStars = 0;
    let totalIntegrity = 0;

    const analyzedRepos = await Promise.all(
      activeRepos.map(async (repo) => {
        totalStars += repo.stargazers_count || 0;

        let languages: Record<string, number> = {};
        try {
          const langRes = await fetch(repo.languages_url, { headers });
          if (langRes.ok) {
            languages = await langRes.json();
            Object.entries(languages).forEach(([l, bytes]) => {
              langTotals[l] = (langTotals[l] || 0) + bytes;
              allSkills.add(l);
            });
          }
        } catch {
          // ignore
        }

        let readmeSnippet = "None";
        try {
          const readmeRes = await fetch(
            `https://api.github.com/repos/${cleanUsername}/${repo.name}/readme`,
            { headers }
          );
          if (readmeRes.ok) {
            const readmeData = await readmeRes.json();
            if (readmeData.content) {
              const decoded = Buffer.from(readmeData.content, "base64").toString("utf-8");
              readmeSnippet = decoded.substring(0, 1200);
            }
          }
        } catch {
          // ignore
        }

        let integrityData = {
          integrity_score: 95,
          integrity_flags: [] as string[],
          integrity_status: "verified" as "verified" | "flagged",
          verified_skills: [] as string[],
        };

        try {
          const aiResult = await evaluateEvidenceIntegrity("github", {
            githubData: {
              name: repo.name,
              description: repo.description,
              size: repo.size,
              stargazers_count: repo.stargazers_count,
              forks_count: repo.forks_count,
              open_issues_count: repo.open_issues_count,
              pushed_at: repo.pushed_at,
              created_at: repo.created_at,
              updated_at: repo.updated_at,
              languages,
              readme_snippet: readmeSnippet,
            },
          });
          integrityData = { ...integrityData, ...aiResult };
        } catch (e) {
          console.error(`[GitProof] Anti-cheat failed on ${repo.name}:`, e);
        }

        if (integrityData.verified_skills) {
          integrityData.verified_skills.forEach((s) => allSkills.add(s));
        }

        totalIntegrity += integrityData.integrity_score;

        return {
          name: repo.name,
          description: repo.description,
          html_url: repo.html_url,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          primary_language: repo.language,
          languages,
          integrity_score: integrityData.integrity_score,
          integrity_status: integrityData.integrity_status,
          integrity_flags: integrityData.integrity_flags,
          verified_skills: integrityData.verified_skills || [],
        };
      })
    );

    const avgScore =
      analyzedRepos.length > 0 ? Math.round(totalIntegrity / analyzedRepos.length) : 90;

    const topLanguages = Object.entries(langTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    return {
      success: true,
      profile: {
        login: ghUser.login,
        name: ghUser.name || ghUser.login,
        avatar_url: ghUser.avatar_url,
        bio: ghUser.bio,
        public_repos: ghUser.public_repos,
        html_url: ghUser.html_url,
        followers: ghUser.followers,
      },
      repos: analyzedRepos,
      verifiedSkills: Array.from(allSkills),
      overallIntegrityScore: avgScore,
      totalStars,
      topLanguages,
    };
  } catch (err: any) {
    console.error("[GitProof] Realtime analysis error:", err);
    return { success: false, error: err?.message || "Failed to analyze GitHub account." };
  }
}


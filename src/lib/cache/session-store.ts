"use client";

const STORAGE_KEYS = {
  GITHUB_USER: "signal_github_user",
  GITHUB_TOKEN: "signal_github_token",
  USER_PROFILE: "signal_user_profile",
  PASSPORT_CACHE: "signal_passport_cache",
  AUTH_SESSION: "signal_auth_session",
};

export function saveCachedSession(data: {
  githubUsername?: string;
  githubToken?: string;
  profile?: any;
  passport?: any;
}) {
  if (typeof window === "undefined") return;
  try {
    if (data.githubUsername) localStorage.setItem(STORAGE_KEYS.GITHUB_USER, data.githubUsername);
    if (data.githubToken) localStorage.setItem(STORAGE_KEYS.GITHUB_TOKEN, data.githubToken);
    if (data.profile) localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(data.profile));
    if (data.passport) localStorage.setItem(STORAGE_KEYS.PASSPORT_CACHE, JSON.stringify(data.passport));
  } catch (e) {
    console.warn("Local storage write failed:", e);
  }
}

export function getCachedSession() {
  if (typeof window === "undefined") return null;
  try {
    const githubUser = localStorage.getItem(STORAGE_KEYS.GITHUB_USER);
    const githubToken = localStorage.getItem(STORAGE_KEYS.GITHUB_TOKEN);
    const profileRaw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    const passportRaw = localStorage.getItem(STORAGE_KEYS.PASSPORT_CACHE);

    return {
      githubUsername: githubUser || null,
      githubToken: githubToken || null,
      profile: profileRaw ? JSON.parse(profileRaw) : null,
      passport: passportRaw ? JSON.parse(passportRaw) : null,
      hasCachedData: !!(githubUser || profileRaw || passportRaw),
    };
  } catch (e) {
    console.warn("Local storage read failed:", e);
    return null;
  }
}
